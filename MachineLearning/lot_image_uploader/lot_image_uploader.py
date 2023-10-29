# Takes a current screenshot of a YouTube Live video (see sample for results) 
#
# Note that for this Python to work you need 2 packages, and you need to manually edit both since they are out of date

# 1. pafy (pip install pafy)
#   Open the following script in a text editor:
#     .../lib/python3.9/site-packages/pafy/backend_youtube_dl.py
#   Comment out the code after likes and dislikes and set them to = 0
#     self._likes = 0 #self._ydl_info['like_count']
#     self._dislikes = 0 #self._ydl_info['dislike_count']

# 2. youtube-dl (pip install youtube-dl)
#   Open the following script in a text editor:
#     ...lib/python3.9/site-packages/youtube_dl/extractor/youtube.py
#   Replace this line:
#     'uploader_id': self._search_regex(r'/(?:channel|user)/([^/?&#]+)', owner_profile_url, 'uploader id') if owner_profile_url else None,
#   With this line: 
#     'uploader_id': self._search_regex(r'/(?:channel/|user/|(?=@))([^/?&#]+)', owner_profile_url, 'uploader id', default=None),


import cv2
import pafy
import datetime
import time
import sys
import requests

# url = "http://localhost:8000/lot/upload-image/"  
url = "https://devapi.gruevy.com/lot/upload-image/"  
cam_url = "https://www.youtube.com/watch?v=EPKWu223XEg"

def capture_frame(video_url):
    # get video and construct stream URL
    filename = ""

    video = pafy.new(video_url)
    best = video.getbest(preftype="mp4")
    video_stream_url = best.url

    # open video stream
    cap = cv2.VideoCapture(video_stream_url)
    ret, frame = cap.read()
    if ret:  # if frame read successfully
        # save frame to image file
        now = datetime.datetime.now()
        filename = now.strftime("%Y%m%d%H%M.jpg")
        filename = 'colltown_' + filename
        cv2.imwrite(filename, frame)
        taken_time = now.strftime("%Y-%m-%d %H:%M")
        print('Screenshot taken ' + taken_time)
        # print message
    else:
        print("Error reading frame from video stream")

    cap.release()
    cv2.destroyAllWindows()

    try:
        files = {
            "image": open(filename, "rb")
        }
        full_url = f"{url}?passcode=tokensecurity"
        response = requests.post(full_url, files=files)

        print("Response status code:", response.status_code)
        print("Response content:", response.json())

    except IndexError:
        print("Please provide the image filename as a command line argument.")

capture_frame(cam_url)
while True:
    # Change URL to *live* YouTube video of which you want a screenshot
    try:
        time.sleep(30 * 60)
        capture_frame(cam_url)

    except:
    	    print('Failed, trying again in 30')
