from pydantic import BaseModel, EmailStr


class UserSignUp(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    name: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    access_token: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str