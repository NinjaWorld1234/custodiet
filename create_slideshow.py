import subprocess
import os
import glob

# Configuration
artifact_dir = r"C:\Users\computech\.gemini\antigravity\brain\0436b00d-bcf3-4b25-ab65-06adf704a347"
audio_path = r"d:\Naser-Programs\Zaki\custodiet\custodiet_narration_ar.mp3"
output_path = r"d:\Naser-Programs\Zaki\custodiet\custodiet_promo_slideshow.mp4"
concat_list_path = os.path.join(artifact_dir, "slideshow_input.txt")

# Get list of images
image_patterns = [
    os.path.join(artifact_dir, "*.png")
]
images = []
for pattern in image_patterns:
    images.extend(glob.glob(pattern))

# Sort to ensure consistent order (optional, maybe by time?)
images.sort(key=os.path.getmtime)

if not images:
    print("No images found!")
    exit(1)

print(f"Found {len(images)} images.")

# Calculate duration
# We know audio is ~68 seconds.
# Let's get precise duration if possible, or just use 68.
audio_duration = 67.824 # From previous ffprobe
image_duration = audio_duration / len(images)

print(f"Audio duration: {audio_duration}s")
print(f"Duration per image: {image_duration}s")

# Create concat file
# Format:
# file 'path'
# duration X
with open(concat_list_path, 'w', encoding='utf-8') as f:
    for img in images:
        # FFmpeg requires forward slashes or escaped backslashes in concat files
        safe_path = img.replace('\\', '/')
        f.write(f"file '{safe_path}'\n")
        f.write(f"duration {image_duration:.4f}\n")
    
    # Repeat the last image to ensure it doesn't utilize a default duration or cut off too early
    # (The concat demuxer can sometimes be tricky with the last frame)
    safe_path = images[-1].replace('\\', '/')
    f.write(f"file '{safe_path}'\n")

print(f"Created concat file at {concat_list_path}")

# FFmpeg command
# -f concat: Use concat demuxer
# -safe 0: Allow unsafe paths (absolute paths)
# -i concat_list_path: Input file list
# -i audio_path: Input audio
# -c:v libx264: Video codec
# -r 30: Framework (to ensure compatible video stream)
# -pix_fmt yuv420p: Pixel format
# -c:a aac: Audio codec
# -shortest: End when the shortest stream ends (likely the video input from concat, which matches audio duration roughly)
# Actually, since we calculated duration to match audio, -shortest is good safety.
command = [
    "ffmpeg",
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list_path,
    "-i", audio_path,
    "-c:v", "libx264",
    "-r", "30",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest", # Ensure we don't overrun if calculation is slightly off
    output_path
]

print(f"Running FFmpeg command...")
try:
    subprocess.run(command, check=True)
    print(f"Successfully created slideshow video at: {output_path}")
except subprocess.CalledProcessError as e:
    print(f"Error creating video: {e}")
