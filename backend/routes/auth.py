from fastapi import APIRouter, HTTPException

from models.user import UserSignUp
from services.supabase_client import supabase, supabase_admin
from models.user import UserSignUp, UserLogin

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