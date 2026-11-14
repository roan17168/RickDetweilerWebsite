window.WCIRF_IN_COLLEGE = {
  "quiz": {
    "questions": [
      {
        "id": "professor",
        "card": "professor",
        "text": "How often do you talk with a professor about anything besides an assignment or a grade?",
        "options": [
          {
            "text": "Pretty often. We talk about ideas, plans or life.",
            "score": 2
          },
          {
            "text": "Once in a while, usually right after class.",
            "score": 1
          },
          {
            "text": "Not yet. I wouldn't know what to say.",
            "score": 0
          }
        ]
      },
      {
        "id": "courses",
        "card": "courses",
        "text": "How often do you take a course that has nothing to do with your major?",
        "options": [
          {
            "text": "Regularly. I look for them.",
            "score": 2
          },
          {
            "text": "Sometimes, when a requirement makes me.",
            "score": 1
          },
          {
            "text": "Rarely. My schedule is all major and requirements.",
            "score": 0
          }
        ]
      },
      {
        "id": "thinking",
        "card": "thinking",
        "text": "In your classes, how often do you have to defend a view, or work on a problem with no single right answer?",
        "options": [
          {
            "text": "In most of them.",
            "score": 2
          },
          {
            "text": "In some. The rest are lectures and exams.",
            "score": 1
          },
          {
            "text": "Hardly ever.",
            "score": 0
          }
        ]
      },
      {
        "id": "involvement",
        "card": "involvement",
        "text": "Outside class, how much are you part of something on campus: a club, team, job, lab or project?",
        "options": [
          {
            "text": "A lot. I help run something or show up every week.",
            "score": 2
          },
          {
            "text": "Some. I go when I can.",
            "score": 1
          },
          {
            "text": "Most weeks, class is the only thing I'm on campus for.",
            "score": 0
          }
        ]
      },
      {
        "id": "conversations",
        "card": "conversations",
        "text": "How often do you have a real conversation with someone whose background or point of view is different from yours?",
        "options": [
          {
            "text": "Often.",
            "score": 2
          },
          {
            "text": "Sometimes, but we usually keep it light.",
            "score": 1
          },
          {
            "text": "Not much yet. Most people I spend time with are a lot like me.",
            "score": 0
          }
        ]
      }
    ],
    "optional": {
      "text": "One more, if you like (optional, not scored): Which describe your college life? Pick all that fit.",
      "options": [
        {
          "text": "A small college where professors know students",
          "priorities": ["already"]
        },
        {
          "text": "A big university with large classes",
          "priorities": ["big"]
        },
        {
          "text": "I work or commute",
          "priorities": ["short", "work"]
        },
        {
          "text": "Engineering, nursing or another program with set requirements",
          "priorities": ["requirements", "science"]
        },
        {
          "text": "I'm the first in my family to go to college",
          "priorities": ["hard"]
        }
      ]
    },
    "results": [
      {
        "key": "lasting",
        "min": 8,
        "max": 10,
        "openCards": 1,
        "heading": "You're getting the part that lasts (8 to 10 points)",
        "lead": "You already have most of what graduates with good and successful lives had in common. The next step is to go deeper in one of them.",
        "questions": [
          "Which professor could still matter to me in ten years, and have I asked for more of their time?",
          "Am I a member of a group where I could be responsible for something?",
          "Which conversation with someone who disagrees with me have I been putting off?"
        ],
        "action": "This semester. Ask one professor to be involved with something that is yours: a project, a research question or an independent study. If you're stretched thin, do fewer things more deeply: lead one group rather than attending four."
      },
      {
        "key": "partway",
        "min": 4,
        "max": 7,
        "openCards": 2,
        "heading": "You're partway there (4 to 7 points)",
        "lead": "You have some of these and are missing others. Most students are here, and each gap closes with one small move.",
        "questions": [
          "Which of the five questions did I score lowest on, and what has been in the way?",
          "Which professor this term seems easiest to talk to?",
          "What course outside my major have I been curious about and putting off?"
        ],
        "action": "This semester. Open your two lowest cards below and do the \"Start small\" move on each."
      },
      {
        "key": "classes",
        "min": 0,
        "max": 3,
        "openCards": 1,
        "heading": "You've got the classes. Here's the part nobody told you about. (0 to 3 points)",
        "lead": "Class is the required part of college. The research says the part of college that has lasting impact mostly happens around it. Plenty of students are where you are, usually because of work, a commute, family or a rough year. One small move this semester is enough to start.",
        "questions": [
          "What is really in the way: time, money, nerves, or not knowing where to begin?",
          "Which professor this term seems easiest to talk to?",
          "What is one thing on campus I'd go to if a friend came with me?"
        ],
        "action": "This semester. Pick one card below and do its \"Start small\" move. Just one. If something bigger is in the way, such as a class you're failing, money, or wondering whether to stay, start with \"When college gets hard\" below."
      }
    ]
  },
  "planCards": [
    "Time with a professor outside class",
    "Courses outside your major",
    "Classes that make you think",
    "Being part of something on campus",
    "Real conversations with people who see things differently"
  ]
};
