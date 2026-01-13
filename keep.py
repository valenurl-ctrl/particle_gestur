import time
import os
import sys

lyrics = [
    ("Do you ever feel the need to", 1.8),
    ("get away from me?", 0.7),
    ("Do I bore you?", 1.3),
    ("Or do you want to", 0.5),
    ("Take me from this crowded place to", 1.0),
    ("Somewhere we can find some peace", 0.5),
    ("And the world is ours", 1.0),
    ("To keep....", 10.0),
]

char_delay = 0.08
slash_pause = 1.0

def display_lyrics(lyrics_list):
    os.system('cls' if os.name == 'nt' else 'clear')
    print("\n=== Ours To Keep ===\n")
    
    for line, pause in lyrics_list:
        for char in line:
            print(char, end='', flush=True)
            time.sleep(char_delay)
        print()
        time.sleep(pause)
        
    print("\n🎵 Lagu selesai. Terima kasih sudah mendengarkan! 🎵")

if __name__ == "__main__":
    try:
        display_lyrics(lyrics)
    except KeyboardInterrupt:
        print("\n\nDisplay interrupted by user.")
        sys.exit(0)