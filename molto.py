import time
import os
import sys

lyrics = [
    ("Minumulto na 'ko ng damdamin ko...", 0.9),
    ("Ng damdamin ko..", 0.9),
    ("Hindi mo ba ako lilisanin?", 1.9),
    ("Hindi pa ba sapat", 1.1),
    ("pagpapahirap sa 'kin? (Damdamin ko..)", 0.1),
    ("Hindi na ba ma-mamamayapa?", 1.8),
    ("Hindi na ba ma-mamamayapa?", 1.4),
    ("Hindi na maakalaya..", 0.0),
]

char_delay = 0.08
slash_pause = 1.0

def display_lyrics(lyrics_list):
    os.system('cls' if os.name == 'nt' else 'clear')
    print("🎧 Playing : Multo\n───────────────────────────────\n")
    
    for line, pause in lyrics_list:
        for char in line:
            print(char, end='', flush=True)
            time.sleep(char_delay)
        print()
        time.sleep(pause)
        
    print("\nGACOR WAK, BTW JANGAN LUPA TIDUR\n───────────────────────────────\n")

if __name__ == "__main__":
    try:
        display_lyrics(lyrics)
    except KeyboardInterrupt:
        print("\n\nDisplay interrupted by user.")
        sys.exit(0)