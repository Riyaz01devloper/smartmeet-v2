from sqlalchemy import Column, Integer, String,Text 
from app.database.db import Base 

class Meeting(Base) :
    __tablename__ = "meetings" 
    
    id= Column (Integer, primary_key=True ,index=True)
    
    filename = Column(String)
    file_path = Column(String)
    transcript = Column(String)
    summary=Column(Text)
    
