import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import profileReducer from "../slices/profileSlice";
import courseReducer from "../slices/courseSlice";
import cartReducer from "../slices/cartSlice";
import viewCourseReducer from "../slices/viewCourseSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  cart: cartReducer,
  viewCourse: viewCourseReducer,
  course: courseReducer,
});

export default rootReducer;
