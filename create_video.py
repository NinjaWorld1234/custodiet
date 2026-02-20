import subprocess
import os

# Paths
image_path = r"C:\Users\computech\.gemini\antigravity\brain\0436b00d-bcf3-4b25-ab65-06adf704a347\custodiet_promo_v1_1771250873446.png"
audio_path = r"d:\Naser-Programs\Zaki\custodiet\custodiet_narration_ar.mp3"
output_path = r"d:\Naser-Programs\Zaki\custodiet\custodiet_promo_video.mp4"

# FFmpeg command
# -loop 1: Loop the image
# -i image_path: Input image
# -i audio_path: Input audio
# -c:v libx264: Video codec
# -tune stillimage: Optimize for still image
# -c:a aac: Audio codec
# -b:a 192k: Audio bitrate
# -pix_fmt yuv420p: Pixel format for compatibility
# -shortest: Finish encoding when the shortest input stream ends (the audio)
command = [
    "ffmpeg",
    "-y", # Overwrite output file if it exists
    "-loop", "1",
    "-i", image_path,
    "-i", audio_path,
    "-c:v", "libx264",
    "-tune", "stillimage",
    "-c:a", "aac",
    "-b:a", "192k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    output_path
]

print(f"Running command: {' '.join(command)}")

try:
    subprocess.run(command, check=True)
    print(f"Successfully created video at: {output_path}")
except subprocess.CalledProcessError as e:
    print(f"Error creating video: {e}")
