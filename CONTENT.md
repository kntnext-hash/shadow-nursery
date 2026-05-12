# Content

This file tracks the required in-game text for Shadow Nursery.

Writing rules:

- Short sentences
- Quiet tone
- No exclamation marks
- No explicit explanation
- No direct naming of the shadow
- No reward language
- No RPG language

## Memory Fragments

| ID | Text | Condition |
| --- | --- | --- |
| MEM_001 | There was a chair here before you arrived. | sessionCount >= 2 |
| MEM_002 | The shadow learned the shape of waiting. | elapsedDays >= 1 |
| MEM_003 | Someone once stood where the light now falls. | lightAngle < 15 at any point |
| MEM_004 | It moved only after you stopped looking. | totalObservations >= 10 |
| MEM_005 | The corner remembers your silence. | elapsedHours >= 12 without opening app |
| MEM_006 | The lamp does not reveal everything. | lamp placed near wall |
| MEM_007 | A room can keep a secret longer than a person. | stage >= present |
| MEM_008 | The shadow was smaller yesterday. You are almost sure. | size > 40 AND elapsedDays >= 3 |
| MEM_009 | It likes the chair near the wall. | chair set to nearCorner AND familiarity > 20 |
| MEM_010 | It dislikes being named. | promptID_004 answered |
| MEM_011 | You changed the light. Something answered. | lightAngle changed more than 60 points in one session |
| MEM_012 | The room has begun to expect you. | sessionCount >= 7 |
| MEM_013 | The shadow is quieter when the table is far away. | table set to center or removed AND calmness > 50 |
| MEM_014 | It does not sleep. You do. | elapsedDays >= 5 |
| MEM_015 | More light does not mean more truth. | lightIntensity > 80 |
| MEM_016 | The bookshelf changes what it reads in the room. | bookshelf placed at any position |
| MEM_017 | Behind the curtain, the light came from somewhere else. | curtain placed AND lightAngle > 70 |
| MEM_018 | It recognized the room before you did. | stage >= familiar |
| MEM_019 | You have sat here before. The room agrees. | totalMinutesObserved >= 60 |
| MEM_020 | The corner was never empty. | memoryCount >= 10 |
| MEM_021 | It does not grow toward you. It grows around you. | familiarity > 60 AND unease > 40 |
| MEM_022 | The hallway is quieter than you expected. | hallway unlocked AND visited at least once |
| MEM_023 | This was a child's room once. | childRoom unlocked |
| MEM_024 | The mirror was removed for a reason. | mirrorFragment placed at any position |
| MEM_025 | It does not like mirrors either. | mirrorFragment placed AND unease > 60 |
| MEM_026 | In the empty room, only one thing remained. | emptyRoom visited |
| MEM_027 | You have stopped asking what it is. | sessionCount >= 20 |
| MEM_028 | It was watching before you arrived today. | stage = watching |
| MEM_029 | The shape it takes is not the shape it has. | distortion > 70 |
| MEM_030 | It will be here when you are gone. | stage = unknown |

## Shadow Prompts

| ID | Text | Choice A | Effect A | Choice B | Effect B | Condition |
| --- | --- | --- | --- | --- | --- | --- |
| PRO_001 | Do you want the light closer? | yes | calmness +5, familiarity +3 | no | unease +5, distortion +3 | stage >= dormant, sessionCount >= 1 |
| PRO_002 | Should the chair stay where it is? | let it stay | familiarity +5 | move it away | unease +3, calmness -2 | chair placed at any position |
| PRO_003 | Did you move it, or did I? | I moved it | calmness +2 | you moved it | unease +6, familiarity +2 | furniture moved at least once |
| PRO_004 | Is this corner mine? | yes | familiarity +8, unease +3 | no | distortion +5, calmness -3 | stage >= aware |
| PRO_005 | Should I remain small? | yes | calmness +5, size -3 | no | size +6, unease +4 | stage >= aware |
| PRO_006 | Will you come back tomorrow? | yes | familiarity +5 | I don't know | unease +5 | sessionCount >= 3 |
| PRO_007 | The lamp is too close. | I'll move it | calmness +4 | it stays | unease +3, distortion +2 | lamp placed nearCorner or nearWall |
| PRO_008 | Do you leave the light on when you sleep? | yes | calmness +3, familiarity +2 | no | unease +4, size +2 | stage >= present |
| PRO_009 | Do you see me differently now? | yes | familiarity +6, unease +3 | no | distortion +4 | stage >= present AND memoryCount >= 5 |
| PRO_010 | Should I take up more space? | no | calmness +4, size -4 | if you need to | size +8, unease +5 | size > 40 |
| PRO_011 | Were you afraid of the dark as a child? | yes | familiarity +5, unease +3 | no | calmness +2, distortion +2 | childRoom unlocked OR stage >= familiar |
| PRO_012 | The room looks different at night. | I know | familiarity +4 | it looks the same | unease +5, distortion +3 | stage >= familiar |
| PRO_013 | Something about the bookshelf. | what about it? | familiarity +3, unease +2 | I don't want to know | calmness +3, distortion +2 | bookshelf present |
| PRO_014 | I remember something you forgot. | tell me | unease +8, familiarity +4, unlocks MEM_029 | keep it | calmness +5 | stage >= familiar AND memoryCount >= 15 |
| PRO_015 | Do you think about me when you're not here? | sometimes | familiarity +6 | I try not to | unease +6, distortion +3 | stage >= familiar |
| PRO_016 | The mirror was yours, wasn't it? | I don't remember | familiarity +4, unease +5 | it wasn't mine | distortion +6 | mirrorFragment placed |
| PRO_017 | Should I show you what I've become? | yes | unease +10, familiarity +5 | not yet | calmness +5 | stage >= watching |
| PRO_018 | You've been here a long time. | I know | familiarity +4 | not long enough | unease +6, size +4 | totalMinutesObserved >= 120 |
| PRO_019 | Do you want to know my name? | yes | unease +12, distortion +5, unlocks MEM_010 | no | calmness +8 | stage = watching |
| PRO_020 | Will you stay? | yes | familiarity +10, unease +8 | I don't know | distortion +8, calmness -4 | stage = watching OR stage = unknown |

