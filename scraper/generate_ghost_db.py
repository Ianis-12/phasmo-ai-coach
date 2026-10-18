import json
import os

print("Assembling the ultimate Phasmophobia 24-Ghost Database...")

ghosts_database = {
    "Spirit": {
        "name": "Spirit",
        "evidence": ["EMF Level 5", "Spirit Box", "Ghost Writing"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "smudgeTimer": "Smudging prevents hunting for 3 minutes (180s) instead of the normal 90s."
        },
        "testingStrategies": ["Smudge the ghost room at 0% sanity. If you don't get a hunt for exactly 3 minutes, it is a Spirit."]
    },
    "Wraith": {
        "name": "Wraith",
        "evidence": ["EMF Level 5", "Spirit Box", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "saltImmunity": "Never steps in salt or leaves UV footprints.",
            "teleportation": "Can teleport directly to a random player, giving EMF 2 or 5."
        },
        "testingStrategies": ["Place salt in chokepoints. If the ghost passes through during an event/hunt but salt is untouched, it's a Wraith."]
    },
    "Phantom": {
        "name": "Phantom",
        "evidence": ["Spirit Box", "Ultraviolet", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "photos": "Disappears instantly when photographed during an event, and the photo will be perfectly clear with no glitching.",
            "sanityDrain": "Drains sanity 2x faster when looking at it during an event.",
            "huntBlinking": "Is invisible for longer periods while blinking during a hunt."
        },
        "testingStrategies": ["Take a photo of a ghost event. If it vanishes but the audio continues, and the journal photo has no ghost and no static, it's a Phantom."]
    },
    "Poltergeist": {
        "name": "Poltergeist",
        "evidence": ["Spirit Box", "Ultraviolet", "Ghost Writing"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "throwingPower": "Can throw multiple items at once (Polty-bomb) draining 2% sanity per item thrown.",
            "huntThrowing": "Throws an item every 0.5 seconds during a hunt (100% chance vs normal 50%)."
        },
        "testingStrategies": ["Pile items on a table. If they explode outward all at once, it's a Poltergeist."]
    },
    "Banshee": {
        "name": "Banshee",
        "evidence": ["Ultraviolet", "Ghost Orb", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50, # Based on target's sanity, not team average
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "targeting": "Targets only one player at a time and ignores everyone else during a hunt until that player dies.",
            "paramic": "Has a 33% chance to produce a unique screaming sound on the Parabolic Microphone.",
            "events": "Highly likely to do singing ghost events."
        },
        "testingStrategies": ["Have the non-target stand inside the ghost during a hunt. If they don't die, it's a Banshee."]
    },
    "Jinn": {
        "name": "Jinn",
        "evidence": ["EMF Level 5", "Ultraviolet", "Freezing Temperatures"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "speedAbility": "If the breaker is ON and it sees you from afar, it speeds up to 2.5m/s until it gets within 3 meters, then slows down.",
            "breaker": "Cannot turn the breaker off directly."
        },
        "testingStrategies": ["Turn the breaker ON. If it zooms toward you from down the hall but abruptly slows down when close, it's a Jinn."]
    },
    "Mare": {
        "name": "Mare",
        "evidence": ["Spirit Box", "Ghost Orb", "Ghost Writing"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 60, # 60% in dark, 40% in light
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "lightAversion": "Can hunt at 60% sanity in the dark, but only 40% in lit rooms. Will NEVER turn a light switch ON.",
            "lightSmash": "Has a high chance to instantly flick a light off right after you turn it on."
        },
        "testingStrategies": ["Turn on the light in its room. If it instantly turns it off, highly likely a Mare. If it EVER turns a light ON, rule out Mare."]
    },
    "Revenant": {
        "name": "Revenant",
        "evidence": ["Ghost Orb", "Ghost Writing", "Freezing Temperatures"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.0, # Very slow when roaming
        "behavioralTells": {
            "huntSpeed": "Moves at a painfully slow 1.0m/s when roaming. If it gains line-of-sight (or hears you/detects equipment), it rockets to 3.0m/s."
        },
        "testingStrategies": ["Listen to footsteps during a hunt. If they are extremely slow, then suddenly break into a sprint when it sees someone, it's a Rev."]
    },
    "Shade": {
        "name": "Shade",
        "evidence": ["EMF Level 5", "Ghost Writing", "Freezing Temperatures"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 35,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "shy": "Will NEVER hunt if there is a player in the same room. Very low interaction rate when players are near.",
            "events": "Prefers shadowy or airball ghost events over full physical manifestations."
        },
        "testingStrategies": ["Stand in the ghost room with 0% sanity. If it refuses to hunt until you step out into the hallway, it's a Shade."]
    },
    "Demon": {
        "name": "Demon",
        "evidence": ["Ultraviolet", "Ghost Writing", "Freezing Temperatures"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 70, # Can use ability to hunt at 100%
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "aggressive": "Can randomly use an ability to hunt at 100% sanity. Smudge cooldown is only 60 seconds (others are 90s).",
            "crucifix": "Crucifix range is 50% larger (4.5m vs 3m)."
        },
        "testingStrategies": ["If you get hunted within the first 2 minutes of walking in the door at high sanity, it's a Demon."]
    },
    "Yurei": {
        "name": "Yurei",
        "evidence": ["Ghost Orb", "Freezing Temperatures", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "doorSlam": "Can fully shut doors and drain 15% sanity from nearby players in the process. It is the only ghost that can touch the Front Door outside of a hunt.",
            "smudgeTrapping": "Smudging its room traps it in there for 90 seconds."
        },
        "testingStrategies": ["If the main entrance door suddenly closes/clicks while you are exploring (not during a hunt/event), it is a Yurei."]
    },
    "Oni": {
        "name": "Oni",
        "evidence": ["EMF Level 5", "Freezing Temperatures", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "visibility": "Highly visible during hunts (blinks very rapidly).",
            "events": "Cannot do the 'airball' (hissing mist) ghost event. Drains double sanity (20%) during events."
        },
        "testingStrategies": ["If it does the transparent airball hissing event at you, you can instantly rule out Oni."]
    },
    "Yokai": {
        "name": "Yokai",
        "evidence": ["Spirit Box", "Ghost Orb", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50, # 80% if talking
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "voiceTrigger": "Talking near it raises its hunt threshold to 80%.",
            "deafness": "During a hunt, it can only hear player voices or detect electronics from 2.5 meters away (others are 9 meters)."
        },
        "testingStrategies": ["Yell at it during a hunt from 4 meters away with your flashlight on. If it completely ignores you and wanders away, it's a Yokai."]
    },
    "Hantu": {
        "name": "Hantu",
        "evidence": ["Ultraviolet", "Ghost Orb", "Freezing Temperatures"],
        "forcedEvidence": "Freezing Temperatures", # Always gives Freezing on Nightmare/Insanity
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.4, # Depends on room temp
        "behavioralTells": {
            "tempSpeed": "Speed is entirely based on room temperature. Very fast in freezing rooms (2.7m/s), very slow in warm rooms (1.4m/s). Does NOT speed up in line-of-sight.",
            "breath": "If the breaker is OFF, you can see freezing breath coming from the ghost's mouth during a hunt."
        },
        "testingStrategies": ["Turn the breaker ON. If it is sprinting in its freezing room but slows to a crawl the second it enters a warm hallway, it's a Hantu."]
    },
    "Goryo": {
        "name": "Goryo",
        "evidence": ["EMF Level 5", "Ultraviolet", "D.O.T.S"],
        "forcedEvidence": "D.O.T.S", # Always gives DOTS on Nightmare/Insanity
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "dotsRule": "D.O.T.S can ONLY be seen through a video camera, and ONLY if no players are physically in the same room as the ghost.",
            "roaming": "Can never change its favorite room or roam far from it."
        },
        "testingStrategies": ["Set up a video camera and look at the DOTS from the truck. If you see it on camera, but your friend standing in the room cannot see it with their naked eye, it's a Goryo."]
    },
    "Myling": {
        "name": "Myling",
        "evidence": ["EMF Level 5", "Ultraviolet", "Ghost Writing"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "quietHunt": "Footsteps are completely silent during a hunt until it is very close (within 12 meters/flashlight flickering range).",
            "paramic": "Makes significantly more paranormal sounds on the parabolic microphone."
        },
        "testingStrategies": ["Hide with your flashlight on the floor. If the flashlight starts glitching BEFORE you can hear the ghost's footsteps, it's a Myling."]
    },
    "Onryo": {
        "name": "Onryo",
        "evidence": ["Spirit Box", "Ghost Orb", "Freezing Temperatures"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 60,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "candles": "Acts as a crucifix. If it tries to hunt near a lit candle, it blows the candle out and cancels the hunt.",
            "blowoutHunt": "Every time it blows out 3 candles, it instantly attempts a hunt regardless of your sanity."
        },
        "testingStrategies": ["Place a lit candle on top of a crucifix. If the crucifix burns before the candle blows out, rule out Onryo."]
    },
    "The Twins": {
        "name": "The Twins",
        "evidence": ["EMF Level 5", "Spirit Box", "Freezing Temperatures"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7, # Varies by twin
        "behavioralTells": {
            "twinSpeeds": "The 'Main' twin is 10% slower than a normal ghost. The 'Decoy' twin is 10% faster.",
            "interactions": "Will often do two interactions in different rooms at the exact same time."
        },
        "testingStrategies": ["Look at the total activity monitor in the truck. If you see a line that changes direction halfway up (a 'kinked' line), it indicates Twins."]
    },
    "Raiju": {
        "name": "Raiju",
        "evidence": ["EMF Level 5", "Ghost Orb", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 50, # 65% near electronics
        "baseSpeedMPS": 1.7, # 2.5m/s near electronics
        "behavioralTells": {
            "electronicSpeed": "Hunts at 65% sanity and moves incredibly fast (2.5m/s) if near active player electronics (flashlights, DOTS, cameras).",
            "glitchRange": "Glitches electronic equipment from 15 meters away instead of the standard 10 meters."
        },
        "testingStrategies": ["Leave a line of active DOTS and EMFs in a hallway. If it zooms at lightning speed only while running past the equipment, it's a Raiju."]
    },
    "Obake": {
        "name": "Obake",
        "evidence": ["EMF Level 5", "Ultraviolet", "Ghost Orb"],
        "forcedEvidence": "Ultraviolet", # Always gives UV on Nightmare/Insanity
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.7,
        "behavioralTells": {
            "uniqueUV": "Has a 16.6% chance to leave a 6-fingered handprint or a 2-finger lightswitch print. Can also make UV prints disappear twice as fast.",
            "shapeshift": "Guaranteed to shapeshift into a different ghost model for a split second while blinking at least once per hunt."
        },
        "testingStrategies": ["Watch it during a hunt. If it's a tall man, but blinks into a crawling child for a microsecond and turns back, it's an Obake."]
    },
    "The Mimic": {
        "name": "The Mimic",
        "evidence": ["Spirit Box", "Ultraviolet", "Freezing Temperatures"],
        "forcedEvidence": "Ghost Orb", # ALWAYS has Ghost Orbs as a 4th fake evidence, even on 0-evidence runs!
        "huntingSanityThreshold": 50, # Depends on who it mimics
        "baseSpeedMPS": 1.7, # Depends on who it mimics
        "behavioralTells": {
            "mimicry": "Copies the exact behaviors, hunt thresholds, and speeds of other ghosts. Can change who it is mimicking every few minutes."
        },
        "testingStrategies": ["If you find Ghost Orbs on a 0-Evidence difficulty run, it is 100% a Mimic."]
    },
    "Moroi": {
        "name": "Moroi",
        "evidence": ["Spirit Box", "Ghost Writing", "Freezing Temperatures"],
        "forcedEvidence": "Spirit Box", # Always gives Spirit Box on Nightmare/Insanity
        "huntingSanityThreshold": 50,
        "baseSpeedMPS": 1.5, # Varies by sanity
        "behavioralTells": {
            "curse": "Getting a Spirit Box or Paramic response curses you, causing sanity to drain 2x faster (even in light) until you take sanity pills.",
            "sanitySpeed": "The lower the team's average sanity, the faster the ghost is during a hunt. Extremely fast at 0% sanity (2.25m/s base).",
            "smudgeWeakness": "Smudging during a hunt blinds it for 7.5 seconds instead of 5."
        },
        "testingStrategies": ["Use the spirit box, get a response, then stand in the light. If your sanity is still plummeting, you are cursed by a Moroi."]
    },
    "Deogen": {
        "name": "Deogen",
        "evidence": ["Spirit Box", "Ghost Writing", "D.O.T.S"],
        "forcedEvidence": "Spirit Box", # Always gives Spirit Box on Nightmare/Insanity
        "huntingSanityThreshold": 40,
        "baseSpeedMPS": 3.0, # Fast afar, slow close
        "behavioralTells": {
            "wallhacks": "Always knows exactly where you are. You CANNOT hide from a Deogen.",
            "distanceSpeed": "Moves at 3.0m/s when far away from you, but slows down to a crawl (0.4m/s) when it gets within 2.5 meters.",
            "uniqueBox": "Has a 33% chance to give a unique heavy breathing sound on the Spirit Box if you are within 1 meter of it."
        },
        "testingStrategies": ["Do NOT hide. Stand in an open room. If it sprints at you at mach speed but slows to a snail's pace right before hitting you, it's a Deo. Loop it around a table."]
    },
    "Thaye": {
        "name": "Thaye",
        "evidence": ["Ghost Orb", "Ghost Writing", "D.O.T.S"],
        "forcedEvidence": None,
        "huntingSanityThreshold": 75, # Drops to 15% over time
        "baseSpeedMPS": 2.75, # Drops to 1.0m/s over time
        "behavioralTells": {
            "aging": "Starts extremely aggressive, fast, and hunts at 75% sanity. Every 1-2 minutes you spend near it, it 'ages', becoming slower and less active. Fully aged, it hunts at 15% sanity and moves at 1.0m/s."
        },
        "testingStrategies": ["Ask the Ouija Board 'How old are you?' early on, then ask again 10 minutes later. If the age went up, it's a Thaye."]
    }
}

def save_database():
    os.makedirs("../data", exist_ok=True)
    file_path = "../data/ghostData.json"
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(ghosts_database, f, indent=4)
        
    print(f"\nSUCCESS! 100% complete encyclopedia generated.")
    print(f"Total Ghosts: {len(ghosts_database)}")
    print(f"Saved to: {file_path}")

if __name__ == "__main__":
    save_database()