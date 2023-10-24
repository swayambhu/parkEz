# Coldwater Uploader

After installing requirements.txt you must make changes to these folders:

1. pafy (pip install pafy)
  Open the following script in a text editor:
    .../lib/pythonX.X/site-packages/pafy/backend_youtube_dl.py
  Comment out the code after likes and dislikes and set them to = 0
    self._likes = 0 #self._ydl_info['like_count']
    self._dislikes = 0 #self._ydl_info['dislike_count']

1. youtube-dl (pip install youtube-dl)
  Open the following script in a text editor:
    ...lib/pythonX.X/site-packages/youtube_dl/extractor/youtube.py
  Replace this line:
    'uploader_id': self._search_regex(r'/(?:channel|user)/([^/?&#]+)', owner_profile_url, 'uploader id') if owner_profile_url else None,
  With this line: 
    'uploader_id': self._se


Every 30 minutes downloads a screenshot from the Collingwood, ON Youtube stream,
and then uploads to ParkEz server for processing (determines what spots 
are occupied)