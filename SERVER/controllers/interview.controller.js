import fs from "fs"; //Imports Node.js file system module.Allows you to read files from disk, write files, etc.

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"; // pdf to text ke liye package ha ye 
import { askAi } from "../services/openRouter.services.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
export const analyzeResume = async (req, res) => {
  try {                                   // checks if multer uploades any file if not then do this
    if(!req.file){
      return res.status(400).json({ message: "Resume required" });
    }
    
    const filepath = req.file.path       //Gets the path of the uploaded file from Multer. 

    const fileBuffer = await fs.promises.readFile(filepath)//It is a binary representation of the PDF file, i.e., the raw bytes of the file.
//Think of it like: "all the bits inside the PDF file stored in memory as Node.js Buffer".
    const uint8Array = new Uint8Array(fileBuffer)// Converts the Node Buffer to a typed array of 8-bit unsigned integers.
    //It doesn't convert PDF to text. It just prepares the PDF bytes so PDF.js can parse it.

    const pdf = await pdfjsLib.getDocument({data: uint8Array}).promise;

    // 1-pdfjsLib.getDocument({ data: uint8Array })
//This tells PDF.js to load your PDF.
//You pass it the uint8Array, which is the binary content of your PDF.
//PDF.js will read the bytes, parse the PDF structure (pages, fonts, text objects, etc.), and prepare it for you to extract data.


// 2-.promise
//getDocument() returns a PDF loading task, not the PDF directly.
//You use .promise to wait until the PDF is fully loaded.
//Until this promise resolves, PDF.js is still parsing the PDF file.


//3.await
//await pauses your async function until the promise is resolved.
//This means pdf will not get assigned until the PDF is completely loaded and ready.



//4.const pdf = ...
//After await finishes, pdf is now a PDFDocumentProxy object.
//What you can do with it:
//pdf.numPages → total number of pages
//pdf.getPage(n) → get a specific page to extract text
//pdf.getMetadata() → read metadata like author, title
//Important: This does NOT contain text yet; it just lets you access pages and extract text.

let resumeText = "";

// Extract text from all pages
for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();

  const pageText = content.items.map(item => item.str).join(" ");
  resumeText += pageText + "\n";
}

resumeText = resumeText
  .replace(/\s+/g, " ")
  .trim();

const messages = [
  {role:"system",
    content: `Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`,
  },
  {
    role: "user",
    content: resumeText
  }
];
const aiResponse=await askAi(messages)
const parsed=JSON.parse(aiResponse)
fs.unlinkSync(filepath)

res.json({
  role: parsed.role,
  experience: parsed.experience,
  projects: parsed.projects,
  skills: parsed.skills,
  resumeText
});


  } catch (error) {
  console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: error.message });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    console.log("COOKIES:", req.cookies);
    console.log("USERID:", req.userId);
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if(!role || !experience || !mode){
      return res.status(400).json({message:"Role, Experience and Mode are required."})
    }

    const user=await User.findById(req.userId)        // hm user id s user pta kr rhe jo ki isuath se pta ch ajeyga
    
if (!user) {
  return res.status(404).json({
    message: "User not found."
  });
}

if (user.credits < 50) {
  return res.status(400).json({
    message: "Not enough credits. Minimum 50 required."
  });
}
const projectText = Array.isArray(projects) && projects.length
  ? projects.join(", ")
  : "None";

const skillsText = Array.isArray(skills) && skills.length
  ? skills.join(", ")
  : "None";

const safeResume = resumeText?.trim() || "None";
// ye dollar mai jo value hai  vo hme apne fronetdn s lneg
const userPrompt = `
Role:${role}
Experience:${experience}                             
InterviewMode:${mode}
Projects:${projectText}
Skills:${skillsText},
Resume:${safeResume}
`;

if (!userPrompt.trim()) {
  return res.status(400).json({
    message: "Prompt content is empty."
  });
}

   //ye hmne promt tyra kara hai
 const messages = [
  {                                                                             
    role: "system",
    content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.
Difficulty progression:
Question 1 -> easy
Question 2 -> easy
Question 3 -> medium
Question 4 -> medium
Question 5 -> hard

Make questions based on the candidate's role, experience, interviewMode,projects, skills, and resume details.`
  },
  {
    role: "user",
    content: userPrompt
  }
];
// ab ye mesageses ai ko hje h
  const aiResponse=await askAi(messages)   
  if (!aiResponse || !aiResponse.trim()) {
    return res.status(500).json({
        message: "AI returned empty response."
    });
}
const questionsArray = aiResponse
    .split("\n") // pheke questions ko split kraya is backslah se 
    .map(q => q.trim()) // fir map kata and tri  kiya 
    .filter(q => q.length > 0)
    .slice(0, 5);                          // hme shur ke 5 quetsion chiahe




if (questionsArray.length === 0) {
    return res.status(500).json({
        message: "AI failed to generate questions."
    });
}

user.credits -= 50;
await user.save();

const interview = await Interview.create({
 userId: user._id,
    role,
    experience,
    mode,
    resumeText: safeResume,
    questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy","easy","medium","medium","hard"][index],
        timeLimit: [60,60,90,90,120][index],
    }))
})

   // ye hm fronetnd ko bhenjenge
res.json({
    interviewId: interview._id,
    creditsLeft: user.credits,
    userName: user.name,                             
    questions: interview.questions
});
  }           
  // ye agr quetsions na phuche to
  catch (error) {
return res.status(500).json({message:`failded to create interview${error}` });
  }
}
// ab interview ready hai answer submit karana hai
export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body

        const interview = await Interview.findById(interviewId)
        const question = interview.questions[questionIndex]

        // If no answer
        if (!answer) {
            question.score = 0;
            question.feedback = "You did not submit an answer.";
            question.answer = "";
            await interview.save();
            return res.json({ feedback: question.feedback });
        }

        // If time exceeded
        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Answer not evaluated.";
            question.answer = answer;
            await interview.save();
            return res.json({ feedback: question.feedback });
        }

        // ab agr manlo answer hme mil gya usi timelimit mai to hme score return krna hai to usk liye propmt likheng sice ai s lenge hm//
        // to hm ai ko messge bhj rhe hai//
        const messages = [
            {
                role: "system",
                content: `You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence - Does the answer sound clear, confident, and well-presented?
2. Communication - Is the language simple, clear, and easy to understand?
3. Correctness - Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
    "confidence": number,
    "communication": number,
    "correctness": number,
    "finalScore": number,
    "feedback": "short human feedback"
}`
            },
            {
                role: "user",
                content: `Question: ${question.question} 
Answer: ${answer}`
            }
        ];

        const aiResponse = await askAi(messages);        // ai ko mesggage bhja
        
        let parsed;
try {
  parsed = JSON.parse(aiResponse);
} catch(e){
  return res.status(500).json({message: "AI returned invalid JSON"});
}
        question.confidence=parsed.confidence;
        question.communication=parsed.communication;
        question.feedback = parsed.feedback;           // ye basically ek question ka schema  h and usme  answer , feedback ye sb hai
        question.answer = answer;    // to ihne hm aaise hi retreive krenge
question.score=parsed.finalScore;
question.correctness=parsed.correctness;

        await interview.save();                // ab interview save // await mlb jb tk save na ho wait kro fir aage bado

        return res.status(200).json({feedback:parsed.feedback})}
  
    catch (error) {
        res.status(500).json({ message: `failed to submit answer${error}` });
    }
}
  // 3rd conmtroller means logic  bnare h ab final score dene ka 
export const finishInterview = async (req, res) => {
    try {
        const {interviewId} = req.body
        const interview = await Interview.findById(interviewId)
        if(!interview){
            return res.status(400).json({message:"failed to find Interview"})
        }

    const totalQuestions = interview.questions.length;         // interview .quetsions ek aray h uski lebgth yani numbe rof quetsion pta lkg gye
    // fir loop lgake har index yahni har questions ke score , communictaion , correctenss sb add kiya hai//
// aur model ke andr finalscore naam se hai ek cheez usme finalscore dalega. mtlb vha set kraenge hm.
let totalScore = 0;
let totalConfidence = 0;
let totalCommunication = 0;
let totalCorrectness = 0;

interview.questions.forEach((q) => {
    totalScore += q.score || 0;
    totalConfidence += q.confidence || 0;
    totalCommunication += q.communication || 0;
    totalCorrectness += q.correctness || 0;
});

const finalScore = totalQuestions       
    ? totalScore / totalQuestions            // mtlb jb sare quetsions honge tbhi socre milega vrn ek bhi missing to nhi milgea 
    : 0;

const avgConfidence = totalQuestions
    ? totalConfidence / totalQuestions
    : 0;

const avgCommunication = totalQuestions
    ? totalCommunication / totalQuestions : 0;
    
    const avgCorrectness = totalQuestions
    ? totalCorrectness / totalQuestions : 0;
    
    interview.finalScore=finalScore;
    interview.status="completed"    //   ye jo model mai satsu vali field hai vo bhi ho gyi poori//
     await interview.save();
    
 
 return res.status(200).json({
    finalScore: Number(finalScore.toFixed(1)),
    confidence: Number(avgConfidence.toFixed(1)),
    communication: Number(avgCommunication.toFixed(1)),
    correctness: Number(avgCorrectness.toFixed(1)),
    questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
    })),
})
}
 
 catch (error) {
return res.status(400).json({message:`failed to finish Interview ${error}`})
    }
}