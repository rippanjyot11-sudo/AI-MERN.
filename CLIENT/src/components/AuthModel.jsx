import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from "react-icons/fa";
import Auth from '../pages/Auth';
// path adjust karo
function AuthModel({ onClose }) {         
// hm functioon as parameter dneeg ki agr authetcition ho gya hai to is mdoel ko mt dikaho

  const { userData } = useSelector((state) => state.user) 
  //yha hmne user ka data liye aurvcheck kiya agr user ka data hai mtlb logout nhinhua to ye
  //ye page mt dikaho

  useEffect(() => {
    if (userData) {
      onClose() // agr user adta hoga to useeffect kam krega jo ki authmodel ko close kr dega
    }
  }, [userData, onClose])

  return (
    <div className='fixed inset-0 z-999 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4'>
      
      {/* vrna hmen ye page bnare h */}

      <div className='relative w-full max-w-md'>

        {/*vrna agar authetcate nhi h to hm ye model kholgee aur usme vhi hoga jo hmne auth ka page bnaya tha taki user dubara login kre*/}

        <button 
          onClick={onClose}
          className='absolute top-8 right-5 text-gray-800 hover:text-black text-xl'
        >
          {/* is cross button ko krte hi hmne onclise vala fucntion call*/}
          <FaTimes size={18}/> 
          {/*ye hmne icon lga diya cross ka */}
        </button> 
        {/* ye hamar cross ka button hai*/}

        <Auth isModel={true}/>
        
      </div>
    </div>
  )
}

export default AuthModel
