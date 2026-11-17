window.WCIRF_CHOOSING = {
  "quiz": {
    "id": "choosing",
    "intro": "Five questions, plus one optional. Two minutes. No sign-up, no wrong answers. You’ll get your result, questions to ask colleges (including ones you can ask without visiting) and a scorecard for your list.",
    "honesty": "Pick the answer that is true for you, even if it is not the one you think you should pick.",
    "skip": "Skip the quiz and go to the recommendations",
    "questions": [
      {
        "id": "c1",
        "text": "Ten years from now, which of these would make you proudest?",
        "options": [
          {
            "text": "Running something I built, or helped build.",
            "outcome": "Leadership"
          },
          {
            "text": "Giving time or money to something bigger than me.",
            "outcome": "Civic Involvement"
          },
          {
            "text": "Still learning something new every year.",
            "outcome": "Continued Learning"
          },
          {
            "text": "A life with art, ideas and other cultures in it.",
            "outcome": "Cultural Involvement"
          },
          {
            "text": "Feeling like my life means something.",
            "outcome": "Fulfillment"
          },
          {
            "text": "Doing well enough to support the people I love.",
            "outcome": "Personal Success"
          }
        ]
      },
      {
        "id": "c2",
        "text": "Which college story would make you say, “that is what I came for”?",
        "options": [
          {
            "text": "A professor asked me to lead a project, and I did it.",
            "outcome": "Leadership"
          },
          {
            "text": "I spent a semester working on a problem in the town around campus.",
            "outcome": "Civic Involvement"
          },
          {
            "text": "I took a class I never expected to like and it changed what I study.",
            "outcome": "Continued Learning"
          },
          {
            "text": "I argued about books, music and ideas I would never have found at home.",
            "outcome": "Cultural Involvement"
          },
          {
            "text": "I finally worked out what I actually care about.",
            "outcome": "Fulfillment"
          },
          {
            "text": "I got the internship, and then the offer.",
            "outcome": "Personal Success"
          }
        ]
      },
      {
        "id": "c3",
        "text": "On a campus visit, what would you most want to see with your own eyes?",
        "options": [
          {
            "text": "Students running the clubs, the teams and the newspaper.",
            "outcome": "Leadership"
          },
          {
            "text": "Students working alongside people off campus.",
            "outcome": "Civic Involvement"
          },
          {
            "text": "A library or lab busy at night with students who want to be there.",
            "outcome": "Continued Learning"
          },
          {
            "text": "A concert, a gallery or a performance with students in the room.",
            "outcome": "Cultural Involvement"
          },
          {
            "text": "Students and professors talking about something that is not on the test.",
            "outcome": "Fulfillment"
          },
          {
            "text": "Students presenting real work to people from outside the college.",
            "outcome": "Personal Success"
          }
        ]
      },
      {
        "id": "c4",
        "text": "What do you most want to be good at by the time you graduate?",
        "options": [
          {
            "text": "Getting people to work together.",
            "outcome": "Leadership"
          },
          {
            "text": "Making something better for the people around me.",
            "outcome": "Civic Involvement"
          },
          {
            "text": "Teaching myself whatever I need next.",
            "outcome": "Continued Learning"
          },
          {
            "text": "Being at home with any idea, culture or kind of person.",
            "outcome": "Cultural Involvement"
          },
          {
            "text": "Staying true to myself under pressure.",
            "outcome": "Fulfillment"
          },
          {
            "text": "Figuring out how things work and getting ahead.",
            "outcome": "Personal Success"
          }
        ]
      },
      {
        "id": "c5",
        "text": "What scares you most about picking the wrong college?",
        "options": [
          {
            "text": "Being a number in a crowd where I can’t make a mark.",
            "outcome": "Leadership"
          },
          {
            "text": "Four years in a bubble, cut off from the real world.",
            "outcome": "Civic Involvement"
          },
          {
            "text": "Learning things that may be out of date in ten years.",
            "outcome": "Continued Learning"
          },
          {
            "text": "A narrow program with no room for anything creative or new.",
            "outcome": "Cultural Involvement"
          },
          {
            "text": "Graduating with a degree and no idea what I want.",
            "outcome": "Fulfillment"
          },
          {
            "text": "Finishing without the skills or contacts to support myself.",
            "outcome": "Personal Success"
          }
        ]
      }
    ],
    "optional": {
      "text": "One more, if you like. What else is on your mind? Pick all that fit.",
      "note": "Not scored. It only adds advice to your result.",
      "options": [
        {
          "text": "How we’ll pay for it",
          "panel": "paying"
        },
        {
          "text": "Being the first in my family to go",
          "panel": "first"
        },
        {
          "text": "Feeling like I belong, and finishing",
          "panel": "belonging"
        },
        {
          "text": "Getting in",
          "panel": "getting"
        },
        {
          "text": "Not getting my first choice",
          "panel": "choice"
        }
      ]
    },
    "tieBreaker": {
      "text": "It’s a free Saturday at college. Which one are you most likely to do?",
      "options": [
        {
          "text": "Run the meeting for a group I helped start.",
          "outcome": "Leadership"
        },
        {
          "text": "Show up for a community project off campus.",
          "outcome": "Civic Involvement"
        },
        {
          "text": "Go down a rabbit hole on something I just got curious about.",
          "outcome": "Continued Learning"
        },
        {
          "text": "Go to a show, an exhibit or a film I know nothing about.",
          "outcome": "Cultural Involvement"
        },
        {
          "text": "Have a long conversation with someone about what matters.",
          "outcome": "Fulfillment"
        },
        {
          "text": "Work on the project, portfolio or application that moves me forward.",
          "outcome": "Personal Success"
        }
      ]
    },
    "results": {
      "Leadership": {
        "slug": "leadership",
        "profile": "The Leader",
        "lead": "Your answers point to leadership. You want college to be a place where you put yourself in front of people, with something real to run.",
        "finding": [
          "The graduates who ended up leading things, at work and in their communities, usually got their start in college, and not in class. They had a professor or mentor who took them seriously, and they got to run something real: a club, a team, a project. The study calls this kind of college an authentic learning community.",
          "So the question isn’t whether a college talks about leadership. It’s whether students like you actually get to lead there."
        ],
        "numbers": [
          "Developing larger perspectives: 28% more likely to be leaders (discussing issues such as peace and justice with other students outside class, 27%; frequent conversations with people of different beliefs and values, 26%). An authentic learning community: 25% (a mentor with lasting impact, 26%; often talking with professors outside class about academic subjects, 22%, and about other subjects, 21%). See all the findings: <a href=\"what-matters.html\">What Matters in College</a>"
        ],
        "ask": [
          "Who runs the clubs, the teams and the newspaper here, students or staff?",
          "How does a first-year student end up leading something by sophomore year?",
          "How many professors will know my name by the end of my first year?"
        ],
        "find": [
          "Open the student newspaper online and see whether students are writing about decisions, or only about events.",
          "Look at the student government minutes. Do they decide anything that costs money?",
          "Count the student organizations, then divide by enrollment. A big list at a huge college can mean fewer seats per student."
        ],
        "cant": [
          "In an online information session, ask: “What is one thing a first-year student here is in charge of?”",
          "Ask admissions to connect you with a student leader by email, and ask how they got the role."
        ],
        "try": "On your next visit or virtual session, ask one student: “What is something students here decided that actually changed?” The pause before the answer tells you a lot.",
        "list": [
          {
            "scope": "Large university",
            "text": "look for honors colleges, residential learning communities and first-year leadership programs, where students run things early."
          },
          {
            "scope": "Small college",
            "text": "ask how many student organizations have a faculty adviser who meets with them, and whether first-year students sit on college committees."
          },
          {
            "scope": "Community college or starting close to home",
            "text": "student government, Phi Theta Kappa (the community college honor society) and campus jobs are leadership seats with few competitors."
          }
        ],
        "support": "Alexander Astin’s study of about 25,000 students at 309 institutions found the peer group to be the single most powerful influence on how students develop, with student-faculty interaction next.<sup><a class=\"source-note\" href=\"#note-8\" data-note=\"note-8\" title=\"See source\">8</a></sup>",
        "closing": "Strengthening graduates’ readiness for the job market is not only appropriate, it is essential. But it is a floor, not a ceiling. — Richard A. Detweiler"
      },
      "Civic Involvement": {
        "slug": "civic-involvement",
        "profile": "The Community Builder",
        "lead": "Your answers point to civic involvement. You want college to connect you to people beyond yourself, and to keep you connected after you leave.",
        "finding": [
          "Graduates who were really involved in college, with professors and with other students outside class, were much more likely to be volunteering and giving back years later. So were graduates who talked with professors about life, not just coursework.",
          "One honest note: voting wasn’t linked to these college experiences. Volunteering and giving were."
        ],
        "numbers": [
          "An authentic learning community: 26% more likely to be civically involved, 56% more likely to give a larger share of income and 42% more likely to volunteer. Taking an active part in campus organizations: 30% (62% for giving). Talking with professors about things other than coursework: 37% more likely to volunteer. A mentor with lasting impact: 28% more likely to volunteer and 38% more likely to give. Living on campus: 27%. See all the findings: <a href=\"what-matters.html\">What Matters in College</a>"
        ],
        "ask": [
          "What share of students do service learning or community-based work, and is it part of courses or added on top?",
          "Which community partners has the college worked with for more than five years?",
          "Is there funding for students who cannot afford to do unpaid community work?"
        ],
        "find": [
          "Search the college site for “community partnership” and see whether the same organizations come up across several years.",
          "Look at whether service appears in course catalogs, not only in the admissions pages."
        ],
        "cant": [
          "Search the college’s news pages for “community partner” or “service learning” and look for projects that run year after year.",
          "Ask a current student by email: “What did you do off campus last semester?”"
        ],
        "try": "Ask an admissions officer: “Name one thing students here did in this town last year that the town noticed.” Specific answers are a good sign.",
        "list": [
          {
            "scope": "Large university",
            "text": "look for a center for civic engagement or community-based learning, and whether its courses count toward your degree."
          },
          {
            "scope": "Small college",
            "text": "ask whether service is built into courses or only into clubs."
          },
          {
            "scope": "Community college or starting close to home",
            "text": "you are already in the community; ask about service-learning courses and paid community internships."
          }
        ],
        "support": "George Kuh found that service learning and other high-impact practices were tied to better grades and to students returning for a second year, with the largest benefits for underrepresented and low-income students.<sup><a class=\"source-note\" href=\"#note-9\" data-note=\"note-9\" title=\"See source\">9</a></sup>",
        "closing": "I want to be someone my community can count on. Someone who gives back what was given to me. — A student, quoted by Richard A. Detweiler, Inside Higher Ed, September 2, 2026"
      },
      "Continued Learning": {
        "slug": "continued-learning",
        "profile": "The Lifelong Learner",
        "lead": "Your answers point to continued learning. You want college to leave you curious, not finished.",
        "finding": [
          "The graduates who were still curious decades later, still reading, taking classes, learning new things, often started in small discussion classes early in college, working on questions with no single right answer.",
          "Exploring paid off too. Taking lots of classes outside your major was linked to staying curious and, as a bonus, to earning more later."
        ],
        "numbers": [
          "Developing larger perspectives: 42% more likely to keep learning (discussing issues such as peace and justice with other students, 56%). Developing intellectual skills: 37% (examining the strengths and weaknesses of their own views, 37%; writing papers in most classes, 32%; questions with no single right answer, 25%). An authentic learning community: 31%. A major not tied to one job: 29%. Breadth: 29%. Engaging teaching: 29% (discussion seminars in the first two years, 25%; small first-year classes, 23%). See all the findings: <a href=\"what-matters.html\">What Matters in College</a>"
        ],
        "ask": [
          "How much of my degree can I take outside my major and still graduate in four years?",
          "How many of my first-year classes will have fewer than 20 students?",
          "Can I change my major in my second year without losing a semester?"
        ],
        "find": [
          "Open the course catalog and add up the credits a major actually requires. Over half the degree is a warning sign for breadth.",
          "Look at the class-size table in the Common Data Set, which most colleges post online."
        ],
        "cant": [
          "Download the course catalog and add up the credits your intended major requires.",
          "Find the Common Data Set online and check the share of classes with fewer than 20 students."
        ],
        "try": "Pick one major you are considering and one you would never choose. Read both sets of requirements. The college that makes it easy to take both is the one with room in it.",
        "list": [
          {
            "scope": "",
            "text": "Check how many credits the major requires, and look for honors seminars or first-year interest groups with small classes."
          },
          {
            "scope": "",
            "text": "Ask how many electives remain after the major and general education."
          },
          {
            "scope": "For community college",
            "text": "choose general education courses that transfer, and pick the sections with the most discussion and writing."
          }
        ],
        "support": "Ernest Pascarella and Patrick Terenzini, reviewing decades of research, concluded that what students do in college matters far more than which college they attend.<sup><a class=\"source-note\" href=\"#note-10\" data-note=\"note-10\" title=\"See source\">10</a></sup>",
        "closing": "A liberal education gives us a greater capacity to be good workers. But it will also give us the capacity to be good partners, friends, parents, and citizens. — Fareed Zakaria, In Defense of a Liberal Education, 2015"
      },
      "Cultural Involvement": {
        "slug": "cultural-involvement",
        "profile": "The Cultural Explorer",
        "lead": "Your answers point to cultural involvement. You want college to widen what you know, who you know and what you notice.",
        "finding": [
          "Graduates who stayed connected to art, music, ideas and people from other cultures were more likely to have had small discussion classes early on, and to have spent real time with people whose backgrounds and beliefs were different from theirs.",
          "It’s not about how many concerts a college lists. It’s whether you actually end up in the room with new ideas and new people."
        ],
        "numbers": [
          "Span of study: 42% more likely to be culturally involved (many humanities courses, 47%). Developing intellectual skills: 40% (writing papers in most classes, 49%). An authentic learning community: 40% (talking with professors about things other than coursework, 39%). A major not tied to one job: 36%. Engaging teaching: 25% (a large student role in discussion, 47%; discussion seminars early on, 37%). Larger perspectives: 22% (learning about people from other cultures, 39%). See all the findings: <a href=\"what-matters.html\">What Matters in College</a>"
        ],
        "ask": [
          "How do students here end up spending real time with people unlike themselves, not just passing them on a path?",
          "What share of students study abroad or take part in exchange programs, and what does it cost?",
          "Which courses are built around discussion rather than lecture?"
        ],
        "find": [
          "Look at the events calendar for an ordinary week in November, not for admitted-students weekend.",
          "Check whether performances, galleries and lectures are open to all students or only to majors."
        ],
        "cant": [
          "Look at the events calendar for an ordinary week in November, not admitted-students weekend.",
          "Ask in an online session: “What share of students study abroad, and what does it cost compared with a semester here?”"
        ],
        "try": "Ask a current student: “When is the last time you changed your mind about something here, and what did it?”",
        "list": [
          {
            "scope": "",
            "text": "Ask whether first-year students get tickets, studio time or seats in small arts courses."
          },
          {
            "scope": "",
            "text": "Ask whether performances and studios are open to students outside the major."
          },
          {
            "scope": "For community college",
            "text": "look at the arts and language courses that transfer, and at your city’s museums and venues, which often have student prices."
          }
        ],
        "support": "Richard Light’s interviews with Harvard undergraduates found that students who did best got to know faculty, worked in groups, wrote a lot, and learned from peers unlike themselves outside class.<sup><a class=\"source-note\" href=\"#note-11\" data-note=\"note-11\" title=\"See source\">11</a></sup>",
        "closing": "It’s in Apple’s DNA that technology alone is not enough. It’s technology married with liberal arts, married with the humanities, that yields us the result that makes our heart sing. — Steve Jobs, 2011"
      },
      "Fulfillment": {
        "slug": "fulfillment",
        "profile": "The Meaning Seeker",
        "lead": "Your answers point to fulfillment. You want college to help you work out who you are and what you are for.",
        "finding": [
          "This is where the biggest difference in the whole study showed up, and it came from how people were taught. Graduates whose professors made them question their own arguments were about two and a half times as likely to say their lives felt deeply fulfilling.",
          "Classes that talked about big questions, regardless of major (what’s right, what matters, what a good life is), and professors who knew students by name pointed the same way."
        ],
        "numbers": [
          "Developing intellectual skills: 66% more likely to report highly fulfilled lives (examining the strengths and weaknesses of their own arguments, 149%; questions with no single right answer, 61%; writing papers in most classes, 51%). Span of study: 59% (philosophical and ethical questions in most classes, 59%). An authentic learning community: 46% (professors who mostly knew their first name, 67%; a mentor, 34%). A major not tied to one job: 44%. Engaging teaching: 33% (discussion seminars in the first two years, 61%). See all the findings: <a href=\"what-matters.html\">What Matters in College</a>"
        ],
        "ask": [
          "In a typical class here, who does most of the talking?",
          "Will I be asked to argue against my own position, and in which courses?",
          "How many of my professors will know my first name?"
        ],
        "find": [
          "Ask to see a real syllabus from a first-year course. Look at whether the assignments have one right answer.",
          "Sit in on a class if you can, and count the minutes students speak."
        ],
        "cant": [
          "Ask admissions for a real syllabus from a first-year course, or find one on a professor’s web page.",
          "Ask whether you can watch a class online, and count the minutes students speak."
        ],
        "try": "Write down one thing you believe right now. Ask each college: “Which course here would make me defend that, and then attack it?”",
        "list": [
          {
            "scope": "",
            "text": "Look for first-year seminars, great-books or honors programs, and small upper-level courses in philosophy, religion or ethics."
          },
          {
            "scope": "",
            "text": "Ask which required courses deal with ethical and philosophical questions, and how they are taught."
          },
          {
            "scope": "For community college",
            "text": "philosophy, ethics and literature courses are often small discussion classes; ask which ones transfer."
          }
        ],
        "support": "Gallup and Purdue found that graduates who had a professor who cared about them as a person, made them excited about learning and encouraged their hopes were more than twice as likely to be engaged at work and thriving in their lives.<sup><a class=\"source-note\" href=\"#note-12\" data-note=\"note-12\" title=\"See source\">12</a></sup>",
        "closing": "Strengthening graduates’ readiness for the job market is not only appropriate, it is essential. But it is a floor, not a ceiling. — Richard A. Detweiler"
      },
      "Personal Success": {
        "slug": "personal-success",
        "profile": "The Career Builder",
        "lead": "Your answers point to personal success. You want college to pay off. The evidence says it does, in a way most people get backwards.",
        "finding": [
          "Here’s what surprised people: a specialized program helped graduates get their first job, but that edge faded. Over a whole career, students who explored lots of subjects did better, and major didn’t predict long-term success.",
          "That was even more true for students who are most often told to play it safe: those from families with less money and those with lower test scores."
        ],
        "numbers": [
          "Across all ages, more than half of classes outside the major: 24% more likely to report a higher income (33% for graduates from lower-income families; 34% for graduates who entered with lower test scores). Over a long career: 53% more likely to report greater success and 72% more likely to report a higher income (72% and 75% for graduates from lower-income families). An authentic learning community, over a long career: 32% more likely to report greater success (64% for graduates from lower-income families). See all the findings: <a href=\"what-matters.html\">What Matters in College</a>"
        ],
        "ask": [
          "What share of students complete an internship or a research project, and is there money for students who cannot work unpaid?",
          "Where are your graduates ten years out, not six months out?",
          "How much of the degree can I take outside my major and still finish in four years?"
        ],
        "find": [
          "Use the federal College Scorecard at collegescorecard.ed.gov for cost at your income level and completion rates.",
          "Run the net price calculator on each college’s own website before you fall in love with a sticker price."
        ],
        "cant": [
          "In an online session, ask: “What share of last year’s graduates had an internship, and how did they find it?”",
          "Look up the college’s alumni on LinkedIn and see where graduates in your intended major work ten years out."
        ],
        "try": "Ask the career office one question: “What do you know about your graduates at age 35?” Colleges that track that far are thinking about your working life, not your first job.",
        "list": [
          {
            "scope": "",
            "text": "Ask what share of students in your intended major complete an internship or research project, and whether there is funding for unpaid ones."
          },
          {
            "scope": "",
            "text": "Ask how alumni networks help graduates find internships and first jobs, and for examples from the last two years."
          },
          {
            "scope": "For community college",
            "text": "ask about transfer agreements with four-year colleges and the earnings of students who transferred and finished."
          }
        ],
        "support": "Stacy Dale and Alan Krueger tracked earnings for more than 20 years and found that, for most students, the effect of attending a more selective college fell close to zero once students’ own abilities and ambitions were accounted for; it remained for Black and Hispanic students and for students whose parents had less education.<sup><a class=\"source-note\" href=\"#note-1\" data-note=\"note-1\" title=\"See source\">1</a></sup>",
        "closing": "I personally think there’s going to be a greater demand in 10 years for liberal arts majors than there were for programming majors and maybe even engineering. — Mark Cuban, 2017"
      }
    },
    "panels": {
      "paying": {
        "title": "Paying for it",
        "body": [
          "The price on the website is not the price most students pay. At private nonprofit colleges, about 9 in 10 first-year students receive grants from the college itself, and on average those grants cover more than half of published tuition.<sup><a class=\"source-note\" href=\"#note-3\" data-note=\"note-3\" title=\"See source\">3</a></sup>",
          "Run the net price calculator on each college’s own site, and check cost at your income level on <strong>collegescorecard.ed.gov</strong>. File the FAFSA at <strong>studentaid.gov</strong> as soon as it opens in the fall of senior year."
        ]
      },
      "first": {
        "title": "First in your family",
        "body": [
          "You are not behind. Find one adult to help you this year: your school counselor if you can get time with one (“I want to go to college, and I am the first in my family. What should I be doing now?”), or, if not, a teacher, coach or librarian, a free program such as TRIO Upward Bound or Talent Search or College Advising Corps, or the admissions counselor each college assigns to your area. Ask about application and test fee waivers. Try three net price calculators, including one private college you assumed was too expensive. File the FAFSA early, because some aid runs out."
        ]
      },
      "belonging": {
        "title": "Belonging, and finishing",
        "body": [
          "Vincent Tinto found that students are more likely to stay and finish when they are connected to both the academic and the social life of a college.<sup><a class=\"source-note\" href=\"#note-13\" data-note=\"note-13\" title=\"See source\">13</a></sup> Ask each college what share of students <em>like you</em> graduate (the graduation rate, measured over four and six years), and what support exists in the first six weeks, when most students who leave decide to. Gregory Walton and Geoffrey Cohen found that a one-hour exercise, in which first-year students read how older students’ worries about belonging had faded, reduced the racial gap in grades by about half through graduation.<sup><a class=\"source-note\" href=\"#note-6\" data-note=\"note-6\" title=\"See source\">6</a></sup> A 2023 study of nearly 27,000 students at 22 colleges and universities found a similar exercise raised the share who completed their first year full-time, especially for students from groups that had historically progressed at lower rates, and most at colleges that gave students real opportunities to belong.<sup><a class=\"source-note\" href=\"#note-7\" data-note=\"note-7\" title=\"See source\">7</a></sup>"
        ]
      },
      "getting": {
        "title": "Getting in",
        "body": [
          "Build a list with colleges you are likely to get into and can afford, some matches, and a few reaches. Don’t get hung up on prestige: Dale and Krueger found that for most students a more selective college made little difference to later earnings once their own abilities were considered, although it made some difference for Black and Hispanic students and for students whose parents had less education.<sup><a class=\"source-note\" href=\"#note-1\" data-note=\"note-1\" title=\"See source\">1</a></sup>"
        ]
      },
      "choice": {
        "title": "If it is not your first choice",
        "body": [
          "The study found that what students <em>did</em> in college mattered more than which college they attended. The five experiences on this site are available at every kind of institution. At larger or less personal places you may have to seek them out, through honors programs, office hours and campus involvement, but they are there. At smaller colleges, and especially liberal arts colleges, they are a normal part of almost everyone’s experience; you would have to make an effort to avoid them."
        ]
      }
    }
  },
  "scorecard": {
    "dealbreakers": [
      {
        "question": "Will it help me become who I want to be?",
        "where": "Your own reflection; the questions your quiz result gave you"
      },
      {
        "question": "Is it affordable after aid?",
        "where": "The college's net price calculator; your financial aid offer; College Scorecard cost by family income"
      },
      {
        "question": "Is it safe?",
        "where": "Campus safety reports; current students; your own visit"
      },
      {
        "question": "Are there support services if I need them?",
        "where": "Student support offices; ask a student whether they used them"
      }
    ],
    "experiences": [
      {
        "key": "faculty",
        "label": "Faculty contact",
        "question": "Will professors know my name by the end of year one?",
        "where": "Are there honors sections or first-year seminars capped under 20, and can I get into them? Do professors or staff advise first-year students? Do full-time professors teach first-year courses?",
        "mine": false
      },
      {
        "key": "breadth",
        "label": "Breadth",
        "question": "Can I take more than half of my courses outside my major?",
        "where": "How many credits does my intended major require? How many electives are left after the major and general education?",
        "mine": false
      },
      {
        "key": "discussion",
        "label": "Classroom discussion",
        "question": "Do students do the talking in small classes?",
        "where": "Are courses mostly lectures, or do most courses involve active student involvement? Which courses are taught as seminars or in small sections?",
        "mine": false
      },
      {
        "key": "community",
        "label": "Community",
        "question": "Do professors know students and spend time with them outside class? Are students involved in clubs, teams and community?",
        "where": "Do students and professors spend time together outside class? What groups or activities do students actually lead? What do students do on weekends?",
        "mine": false
      },
      {
        "key": "finishing",
        "label": "Finishing",
        "question": "What share of students like me graduate?",
        "where": "What share of students who receive Pell Grants graduate within four years? Within six years?",
        "mine": false
      }
    ],
    "summary": [
      "Number of Strongs (starred rows first)",
      "The best example I heard",
      "What worries me"
    ],
    "ownRows": 4
  }
};
