import React from 'react';

function VideoPlayer({ src }) {
    return (
        <video width="800" height="450" controls>
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}

export default VideoPlayer;
