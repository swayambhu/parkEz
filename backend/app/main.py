from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def main():
    return {"message": "hello world"}


@app.get("/trial")
async def trial():
    return {"message": "auto reload development server working"}