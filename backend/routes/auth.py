from fastapi import APIRouter, HTTPException, Depends
from services.supabase_client import supabase, supabase_admin
from dependencies.auth import get_current_user
from models.user import (
    UserSignUp,
    UserLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup")
def signup(user: UserSignUp):
    try:
        # Create the user in Supabase Authentication
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })

        if response.user is None:
            raise HTTPException(
                status_code=400,
                detail="Could not create user"
            )

        # Create the user's profile
        profile_data = {
            "id": str(response.user.id),
            "name": user.name
        }

        supabase_admin.table("profiles").insert(profile_data).execute()

        return {
            "message": "User created successfully",
            "user_id": response.user.id,
            "email": response.user.email,
            "name": user.name
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/login")
def login(user: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        return {
            "message": "Login successful",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    try:
        supabase.auth.reset_password_email(
            request.email,
            options={
                "redirect_to": "http://localhost:5173/reset-password"
            }
        )

        return {
            "message": "If the email is registered, a password reset link has been sent"
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        # Verify the recovery access token
        user_response = supabase.auth.get_user(request.access_token)

        if user_response.user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired recovery link"
            )

        user_id = str(user_response.user.id)

        # Update the password for the verified user
        supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {
                "password": request.password
            }
        )

        return {
            "message": "Password updated successfully"
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired recovery link"
        )

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user=Depends(get_current_user)
):
    try:
        # Verify the current password
        login_response = supabase.auth.sign_in_with_password({
            "email": current_user.email,
            "password": request.current_password
        })

        if login_response.user is None:
            raise HTTPException(
                status_code=401,
                detail="Current password is incorrect"
            )

        # Prevent using the same password
        if request.current_password == request.new_password:
            raise HTTPException(
                status_code=400,
                detail="New password must be different from current password"
            )

        # Update password
        supabase_admin.auth.admin.update_user_by_id(
            str(current_user.id),
            {
                "password": request.new_password
            }
        )

        return {
            "message": "Password changed successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        error_message = str(e).lower()

        if (
            "invalid login credentials" in error_message
            or "invalid credentials" in error_message
        ):
            raise HTTPException(
                status_code=401,
                detail="Current password is incorrect"
            )

        raise HTTPException(
            status_code=400,
            detail="Could not change password"
        )