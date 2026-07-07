from sqlalchemy import Column, Integer, String, Text, ForeignKey  # type: ignore[import]
from app.database.db import Base 
from pydantic import EmailStr

class Meeting(Base) :
    __tablename__ = "meetings" 
    
    id= Column (Integer, primary_key=True ,index=True)
   
    
    filename = Column(String)
    file_path = Column(String)
    transcript = Column(String)
    summary=Column(Text)
    user_id=Column (Integer , ForeignKey("users.id"))
    
class User(Base) :
    __tablename__ = "users"
    id= Column (Integer, primary_key=True ,index=True)

    name= Column (String ,nullable=False)
    email= Column (String, unique=True, index=True)
    password= Column (String, nullable=False)
    
