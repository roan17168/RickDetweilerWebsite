window.WCIRF_FACULTY = {
  "quiz": {
    "questions": [
      {
        "id": "names",
        "practice": "names",
        "text": "How many students in your courses do you know by first name by midterm?",
        "options": [
          { "text": "All or nearly all.", "value": 2 },
          { "text": "Most, especially the ones who speak.", "value": 1 },
          { "text": "A few. The class is too large.", "value": 0 }
        ]
      },
      {
        "id": "outside",
        "practice": "outside",
        "text": "How often do you talk with students outside class about something other than the course?",
        "options": [
          { "text": "Often. It is part of the job as I see it.", "value": 2 },
          { "text": "Sometimes, when a student starts it.", "value": 1 },
          { "text": "Rarely.", "value": 0 }
        ]
      },
      {
        "id": "active",
        "practice": "active",
        "text": "In a typical class meeting, how much of the time are students talking, arguing or working on problems?",
        "options": [
          { "text": "Most of it.", "value": 2 },
          { "text": "About half.", "value": 1 },
          { "text": "A little. I mostly lecture to cover the material.", "value": 0 }
        ]
      },
      {
        "id": "open",
        "practice": "open",
        "text": "How often do your assignments have no single right answer?",
        "options": [
          { "text": "Most of them.", "value": 2 },
          { "text": "Some.", "value": 1 },
          { "text": "Few. The material is cumulative and has right answers.", "value": 0 }
        ]
      },
      {
        "id": "thinking",
        "practice": "thinking",
        "text": "How often do you ask students to state the weaknesses of their own argument or solution?",
        "options": [
          { "text": "Routinely.", "value": 2 },
          { "text": "Occasionally.", "value": 1 },
          { "text": "Rarely.", "value": 0 }
        ]
      }
    ],
    "optional": {
      "text": "One more, if you like (optional, not scored): Which best describes this course? Pick all that fit.",
      "options": [
        { "text": "A small class, under 30 students", "context": "small" },
        { "text": "A large course, 80 or more, perhaps with teaching assistants", "context": "large" },
        { "text": "Many of my students work or commute", "context": "work" },
        { "text": "I teach part-time or as an adjunct", "context": "adjunct" },
        { "text": "A science, math or engineering course", "context": "stem" },
        { "text": "A course in a professional program such as nursing, education or business", "context": "professional" }
      ]
    },
    "results": [
      {
        "key": "relationships",
        "min": 8,
        "max": 10,
        "heading": "Your teaching is built on relationships (8 to 10 points)",
        "lead": "You are already doing what the graduates in the study reported, and the evidence gives you a case to make for protecting it.",
        "questions": [
          "Which of these practices depend on my class size or load staying as they are?",
          "Do my department's reward and review criteria count any of this?",
          "Which colleague could I show this to?"
        ],
        "term": "If one of your courses had to double in size, which two parts of your teaching that matter to student learning would become difficult or impossible? Discuss them with a colleague.",
        "case": "If your institution is weighing larger sections or fewer full-time faculty, the College Leaders section sets out the evidence in the form administrators use, including a checklist with a row on rewarding this work. Share it with your chair or dean."
      },
      {
        "key": "some",
        "min": 4,
        "max": 7,
        "heading": "You do some of this (4 to 7 points)",
        "lead": "Some of the practices linked to long-term outcomes are part of your teaching, and some are not (see the practice cards below). Each of them can be added one course at a time.",
        "questions": [
          "Which of the five would be easiest to add to my next course?",
          "What do I cover in lecture that students could read, so class time can be used for discussion?",
          "Which three students this term could I get to know better?"
        ],
        "term": "Open your two lowest cards below and try the first move in one course."
      },
      {
        "key": "content",
        "min": 0,
        "max": 3,
        "heading": "Your teaching is built on content (0 to 3 points)",
        "lead": "Your courses are organized around covering the material, often for good reasons: large sections, cumulative subjects, a heavy load. The practices below still apply, at a smaller scale.",
        "questions": [
          "What is the smallest version of each practice that would work in a class my size?",
          "Which ten minutes of each class could become a question students argue about?",
          "Could teaching assistants or peer leaders carry part of this?"
        ],
        "term": "Learn twenty names. Ask one question a week that has no single right answer."
      }
    ]
  }
};
