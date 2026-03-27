import {createSlice} from "@reduxjs/toolkit";
const userSlice=createSlice({
    name:"user",
    initialState:{
        userData:null         // ye maien userdata ko intial null kiya jaise usestae mai ktre hai null initially
    },
    reducers:{ // reducers meri user data ki value change krte hai 
setUserData:(state, action)=>{    // state batara hai konsi staate ko change krna hai and konsa action perform krna hai
    state.userData=action.payload    // mtlb hme kosni state badakni aur action krnan hai mtlb jo payload yani data hai use userData  mai dalan
}
}
})
   
export const{setUserData}=userSlice.actions
export default userSlice.reducer