from fastapi import FastAPI

app = FastAPI()

print("Hello world ")

@app.get("/")
async def main():
    return {"message": "hello world"}