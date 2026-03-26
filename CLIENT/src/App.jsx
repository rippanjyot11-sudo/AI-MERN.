import React from 'react'
import {Route,Routes} from'react-router-dom'
import Home from './pages/home'
import Auth from './pages/auth'
import { useEffect } from 'react'
import { setUserData } from './redux/userSlice'
import { useDispatch } from "react-redux"
import axios from "axios"
import InterviewPage from "./pages/InterviewPage"; 
export const ServerUrl="http://localhost:8000"
function App() {
  const dispatch=useDispatch()// ye redux hook hai for setting data
  useEffect(()=>{
    const getUser=async()=>{
      try {
        const result=await axios.get(ServerUrl+"/api/user/current-user",{withCredentials:true})
       // console.log(result.data)             // ye jo backend se user data ara hai vo rpint hoga.......
       // redux set ke baad mughe ye adta chaihe apne redux mai yani user chiye to primt nhi krungi disoatch krungi
       dispatch(setUserData(result.data))// yani jo result.data jo bacjend se user aara hai use set kr diya hmne aur disptch kiya 
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null))
      }
    }
    getUser()

  },[dispatch])
  return (
   <Routes>
    <Route path ='/' element={<Home/>}/>      {/*  mtlb / vale route pe home page dikahega*/}
    <Route path='/auth' element={<Auth/>}/>
    <Route path='/interview' element={<InterviewPage/>}/>
   </Routes>
  ) 
}

export default App