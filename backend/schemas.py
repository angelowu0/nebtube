from pydantic import BaseModel, field_validator


class RegisterRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_looks_valid(cls, v):
        if "@" not in v or len(v) < 3:
            raise ValueError("Enter a valid email address")
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_long_enough(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class UserResponse(BaseModel):
    id: int
    email: str


class SubscriptionCreate(BaseModel):
    platform: str
    identifier: str
    display_name: str

    @field_validator("platform")
    @classmethod
    def platform_is_supported(cls, v):
        if v not in ("youtube", "nebula"):
            raise ValueError("platform must be 'youtube' or 'nebula'")
        return v

    @field_validator("identifier", "display_name")
    @classmethod
    def not_blank(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("This field can't be blank")
        return v


class SubscriptionOut(BaseModel):
    id: int
    platform: str
    identifier: str
    display_name: str

    class Config:
        from_attributes = True
