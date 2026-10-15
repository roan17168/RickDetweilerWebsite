/* ==========================================================================
   WHAT COLLEGE IS REALLY FOR - MASTER ENGINE
   Based on Richard A. Detweiler, The Evidence Liberal Arts Needs (MIT Press, 2021)
   Definitive Revision: October 2026

   CONTENTS
   1.  Configuration
   2.  Quiz data store (6 audiences)
   3.  Optional advice panel library
   4.  Quiz state machine
   5.  Quiz rendering engine
   6.  Result rendering
   7.  Global window bindings (required by inline onclick handlers)
   8.  Navigation, dropdowns, accordions
   9.  Tool handlers: print, copy, autosave
   10. Bootstrap
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. CONFIGURATION
     ------------------------------------------------------------------------ */
  var CONFIG = {
    // Rick's revised text does not call for an uninvited pop-up.
    // Set to true only if you want the quiz to auto-open once per session.
    AUTO_POPUP: false,
    AUTO_POPUP_DELAY_MS: 2000,

    // Choosing an answer advances automatically. No "Next" button.
    AUTO_ADVANCE_MS: 260,

    // Saves what people type into the scorecard / plan / audit / checklist / brief.
    TOOL_AUTOSAVE: true,
    STORAGE_PREFIX: 'wcirf_'
  };

  /* ------------------------------------------------------------------------
     2. QUIZ DATA STORE
     ------------------------------------------------------------------------
     scoring: "outcome"   -> plurality across 6 life outcomes, bonus tie-breaker
              "plurality" -> plurality across 3 named stances, 2-way ties shown together
              "points"    -> Strong 2 / Partway 1 / Not yet 0, banded result
     ------------------------------------------------------------------------ */

  var QUIZ_DATA = {

    /* ====================== 1. CHOOSING A COLLEGE ====================== */
    'Choosing a College': {
      audience: 'Choosing a College',
      scoring: 'outcome',
      intro: {
        heading: 'What do you want college to do for you?',
        text: 'Five questions, plus one optional. About a minute. There are no wrong answers, and you do not pick your own result. It comes from your answers.'
      },
      questions: [
        {
          id: 'c1',
          text: 'Ten years from now, which of these would make you proudest?',
          options: [
            { text: 'Running something I built, or helped build.', mapping: 'Leadership' },
            { text: 'Giving time or money to something bigger than me.', mapping: 'Civic Involvement' },
            { text: 'Still learning something new every year.', mapping: 'Continued Learning' },
            { text: 'A life with art, ideas and other cultures in it.', mapping: 'Cultural Involvement' },
            { text: 'Feeling like my life means something.', mapping: 'Fulfillment' },
            { text: 'Doing well enough to support the people I love.', mapping: 'Personal Success' }
          ]
        },
        {
          id: 'c2',
          text: 'Which college story would make you say, "that is what I came for"?',
          options: [
            { text: 'A professor asked me to lead a project, and I did it.', mapping: 'Leadership' },
            { text: 'I spent a semester working on a problem in the town around campus.', mapping: 'Civic Involvement' },
            { text: 'I took a class I never expected to like and it changed what I study.', mapping: 'Continued Learning' },
            { text: 'I argued about books, music and ideas I would never have found at home.', mapping: 'Cultural Involvement' },
            { text: 'I finally worked out what I actually care about.', mapping: 'Fulfillment' },
            { text: 'I got the internship, and then the offer.', mapping: 'Personal Success' }
          ]
        },
        {
          id: 'c3',
          text: 'On a campus visit, what would you most want to see with your own eyes?',
          options: [
            { text: 'Students running the clubs, the teams and the newspaper.', mapping: 'Leadership' },
            { text: 'Students working alongside people off campus.', mapping: 'Civic Involvement' },
            { text: 'A library or lab busy at night with students who want to be there.', mapping: 'Continued Learning' },
            { text: 'A concert, a gallery or a performance with students in the room.', mapping: 'Cultural Involvement' },
            { text: 'Students and professors talking about something that is not on the test.', mapping: 'Fulfillment' },
            { text: 'Students presenting real work to people from outside the college.', mapping: 'Personal Success' }
          ]
        },
        {
          id: 'c4',
          text: 'What do you most want to be good at by the time you graduate?',
          options: [
            { text: 'Getting people to work together.', mapping: 'Leadership' },
            { text: 'Making something better for the people around me.', mapping: 'Civic Involvement' },
            { text: 'Teaching myself whatever I need next.', mapping: 'Continued Learning' },
            { text: 'Being at home with any idea, culture or kind of person.', mapping: 'Cultural Involvement' },
            { text: 'Staying true to myself under pressure.', mapping: 'Fulfillment' },
            { text: 'Figuring out how things work and getting ahead.', mapping: 'Personal Success' }
          ]
        },
        {
          id: 'c5',
          text: 'What scares you most about picking the wrong college?',
          options: [
            { text: "Being a number in a crowd where I can't make a mark.", mapping: 'Leadership' },
            { text: 'Four years in a bubble, cut off from the real world.', mapping: 'Civic Involvement' },
            { text: 'Learning things that may be out of date in ten years.', mapping: 'Continued Learning' },
            { text: 'A narrow program with no room for anything creative or new.', mapping: 'Cultural Involvement' },
            { text: 'Graduating with a degree and no idea what I want.', mapping: 'Fulfillment' },
            { text: 'Finishing without the skills or contacts to support myself.', mapping: 'Personal Success' }
          ]
        }
      ],
      optional: {
        text: 'One more, if you like. What else is on your mind? Pick all that fit.',
        note: 'Not scored. It only adds advice to your result.',
        options: [
          { text: "How we'll pay for it", panel: 'paying' },
          { text: 'Being the first in my family to go', panel: 'firstgen' },
          { text: 'Feeling like I belong, and finishing', panel: 'belonging' },
          { text: 'Getting in', panel: 'gettingin' },
          { text: 'Not getting my first choice', panel: 'firstchoice' }
        ]
      },
      tieBreaker: {
        text: "It's a free Saturday at college. Which one are you most likely to do?",
        options: [
          { text: 'Run the meeting for a group I helped start.', mapping: 'Leadership' },
          { text: 'Show up for a community project off campus.', mapping: 'Civic Involvement' },
          { text: 'Go down a rabbit hole on something I just got curious about.', mapping: 'Continued Learning' },
          { text: 'Go to a show, an exhibit or a film I know nothing about.', mapping: 'Cultural Involvement' },
          { text: 'Have a long conversation with someone about what matters.', mapping: 'Fulfillment' },
          { text: 'Work on the project, portfolio or application that moves me forward.', mapping: 'Personal Success' }
        ]
      },
      results: {
        'Leadership': {
          profile: 'The Leader',
          outcome: 'Leadership',
          lead: 'Your answers point to leadership. You want college to put you in front of people, with something real to run.',
          research: [
            'In the study, leadership as an adult was most closely linked to what happened around the classroom, not inside the major. Graduates who had a college mentor whose influence lasted were 26% more likely to be leaders as adults. Graduates who often talked with faculty outside class were 21% to 26% more likely.',
            'Close involvement in campus life pointed the same way. Who runs things on campus, and whether students get to, tells you more than the leadership language in the brochure.'
          ],
          ask: [
            'Who runs the clubs, the teams and the newspaper here, students or staff?',
            'How does a first-year student end up leading something by sophomore year?',
            'How many professors will know my name by the end of my first year?'
          ],
          check: [
            'Open the student newspaper online and see whether students are writing about decisions, or only about events.',
            'Look at the student government minutes. Do they decide anything that costs money?',
            'Count the student organizations, then divide by enrollment. A big list at a huge college can mean fewer seats per student.'
          ],
          tryThis: 'On your next visit or virtual session, ask one student: "What is something students here decided that actually changed?" The pause before the answer tells you a lot.',
          otherResearch: 'Alexander Astin\'s study of about 25,000 students at 309 institutions found the peer group to be the single most powerful influence on how students develop, with student-faculty interaction next.',
          quotes: [
            { text: 'Strengthening graduates\u2019 readiness for the job market is not only appropriate, it is essential. But it is a floor, not a ceiling.', cite: 'Richard A. Detweiler' }
          ]
        },
        'Civic Involvement': {
          profile: 'The Community Builder',
          outcome: 'Civic Involvement',
          lead: 'Your answers point to civic involvement. You want college to connect you to people beyond yourself, and to keep you connected after you leave.',
          research: [
            'Graduates who were closely involved with faculty and other students outside class were 56% more likely to give a larger share of their income to nonprofits, and 42% more likely to volunteer. Graduates who often talked with professors about things other than coursework were 37% more likely to volunteer more as adults.',
            'One honest note: in this study, voting was not linked to the college experiences measured. Giving and volunteering were. That is why this site calls the outcome civic involvement rather than altruism.'
          ],
          ask: [
            'What share of students do service learning or community-based work, and is it part of courses or added on top?',
            'Which community partners has the college worked with for more than five years?',
            'Is there funding for students who cannot afford to do unpaid community work?'
          ],
          check: [
            'Search the college site for "community partnership" and see whether the same organizations come up across several years.',
            'Look at whether service appears in course catalogs, not only in the admissions pages.'
          ],
          tryThis: 'Ask an admissions officer: "Name one thing students here did in this town last year that the town noticed." Specific answers are a good sign.',
          otherResearch: 'George Kuh found that service learning and other high-impact practices were tied to better grades and to students returning for a second year, with the largest benefits for underrepresented and low-income students.',
          quotes: [
            { text: 'I want to be someone my community can count on. Someone who gives back what was given to me.', cite: 'A student, quoted by Richard A. Detweiler, Inside Higher Ed, September 2, 2026' }
          ]
        },
        'Continued Learning': {
          profile: 'The Lifelong Learner',
          outcome: 'Continued Learning',
          lead: 'Your answers point to continued learning. You want college to leave you curious, not finished.',
          research: [
            'Graduates who took small discussion classes in their first two years were 25% more likely to keep learning actively as adults. Coursework built on questions with no single right answer was linked to the same outcome, by about 25%.',
            'Breadth mattered here too. Taking more than half of your courses outside your major was linked to continued learning and, separately, to a 24% greater likelihood of reporting a higher income later.'
          ],
          ask: [
            'How much of my degree can I take outside my major and still graduate in four years?',
            'How many of my first-year classes will have fewer than 20 students?',
            'Can I change my major in my second year without losing a semester?'
          ],
          check: [
            'Open the course catalog and add up the credits a major actually requires. Over half the degree is a warning sign for breadth.',
            'Look at the class-size table in the Common Data Set, which most colleges post online.'
          ],
          tryThis: 'Pick one major you are considering and one you would never choose. Read both sets of requirements. The college that makes it easy to take both is the one with room in it.',
          otherResearch: 'Ernest Pascarella and Patrick Terenzini, reviewing decades of research, concluded that what students do in college matters far more than which college they attend.',
          quotes: [
            { text: 'A liberal education gives us a greater capacity to be good workers. But it will also give us the capacity to be good partners, friends, parents, and citizens.', cite: 'Fareed Zakaria, In Defense of a Liberal Education, 2015' }
          ]
        },
        'Cultural Involvement': {
          profile: 'The Cultural Explorer',
          outcome: 'Cultural Involvement',
          lead: 'Your answers point to cultural involvement. You want college to widen what you know, who you know and what you notice.',
          research: [
            'Graduates who took small discussion classes early were 37% more likely to stay closely involved with arts, ideas and other cultures as adults. Serious time with people whose backgrounds and beliefs differed from their own was linked to the same outcome.',
            'This is not about a campus arts calendar. It is about whether students actually end up in rooms with ideas and people unlike their own.'
          ],
          ask: [
            'How do students here end up spending real time with people unlike themselves, not just passing them on a path?',
            'What share of students study abroad or take part in exchange programs, and what does it cost?',
            'Which courses are built around discussion rather than lecture?'
          ],
          check: [
            'Look at the events calendar for an ordinary week in November, not for admitted-students weekend.',
            'Check whether performances, galleries and lectures are open to all students or only to majors.'
          ],
          tryThis: 'Ask a current student: "When is the last time you changed your mind about something here, and what did it?"',
          otherResearch: 'Richard Light\u2019s interviews with Harvard undergraduates found that students who did best got to know faculty, worked in groups, wrote a lot, and learned from peers unlike themselves outside class.',
          quotes: [
            { text: 'It\u2019s in Apple\u2019s DNA that technology alone is not enough. It\u2019s technology married with liberal arts, married with the humanities, that yields us the result that makes our heart sing.', cite: 'Steve Jobs, 2011' }
          ]
        },
        'Fulfillment': {
          profile: 'The Meaning Seeker',
          outcome: 'Fulfillment',
          lead: 'Your answers point to fulfillment. You want college to help you work out who you are and what you are for.',
          research: [
            'This is where the study found its largest differences, and they came from how people were taught. Graduates whose professors made them examine the strengths and weaknesses of their own arguments were 149% more likely to describe their lives as highly fulfilled, about two and a half times as likely.',
            'Graduates who discussed philosophical and ethical questions in most of their classes were 59% more likely to report fulfilled lives. Graduates whose professors mostly knew their first name were 67% more likely. Coursework with no single right answer: 61% more likely.'
          ],
          ask: [
            'In a typical class here, who does most of the talking?',
            'Will I be asked to argue against my own position, and in which courses?',
            'How many of my professors will know my first name?'
          ],
          check: [
            'Ask to see a real syllabus from a first-year course. Look at whether the assignments have one right answer.',
            'Sit in on a class if you can, and count the minutes students speak.'
          ],
          tryThis: 'Write down one thing you believe right now. Ask each college: "Which course here would make me defend that, and then attack it?"',
          otherResearch: 'Gallup and Purdue found that graduates who had a professor who cared about them as a person, made them excited about learning and encouraged their hopes were more than twice as likely to be engaged at work and thriving in their lives.',
          quotes: [
            { text: 'Strengthening graduates\u2019 readiness for the job market is not only appropriate, it is essential. But it is a floor, not a ceiling.', cite: 'Richard A. Detweiler' }
          ]
        },
        'Personal Success': {
          profile: 'The Career Builder',
          outcome: 'Personal Success',
          lead: 'Your answers point to personal success. You want college to pay off. The evidence says it does, in a way most people get backwards.',
          research: [
            'Specialized preparation helped graduates get their first job, but that advantage faded. Over a career, breadth did the work. Graduates who took more than half their courses outside their major were 24% more likely to report a higher income as adults.',
            'The effect was larger for the people most often told to specialize: 33% for graduates from lower-income families and 34% for graduates who entered with lower test scores. Major was unrelated to longer-term success.'
          ],
          ask: [
            'What share of students complete an internship or a research project, and is there money for students who cannot work unpaid?',
            'Where are your graduates ten years out, not six months out?',
            'How much of the degree can I take outside my major and still finish in four years?'
          ],
          check: [
            'Use the federal College Scorecard at collegescorecard.ed.gov for cost at your income level and completion rates.',
            'Run the net price calculator on each college\u2019s own website before you fall in love with a sticker price.'
          ],
          tryThis: 'Ask the career office one question: "What do you know about your graduates at age 35?" Colleges that track that far are thinking about your working life, not your first job.',
          otherResearch: 'Stacy Dale and Alan Krueger tracked earnings for more than 20 years and found that the effect of attending a more selective college fell to close to zero once students\u2019 own abilities and ambitions were accounted for.',
          quotes: [
            { text: 'I personally think there\u2019s going to be a greater demand in 10 years for liberal arts majors than there were for programming majors and maybe even engineering.', cite: 'Mark Cuban, 2017' }
          ]
        }
      }
    },

    /* ============================ 2. IN COLLEGE ============================ */
    'In College': {
      audience: 'In College',
      scoring: 'points',
      intro: {
        heading: 'You picked the college. Now pick the experience.',
        text: 'Five questions. Two minutes. No answer here is a confession. Most students have some of these and not others.'
      },
      questions: [
        {
          id: 'i1',
          text: 'Have you talked with a professor outside class this term, about anything?',
          options: [
            { text: 'Yes, more than once, and not only about grades.', mapping: 'Strong', score: 2 },
            { text: 'Once, briefly.', mapping: 'Partway', score: 1 },
            { text: 'Not yet.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'i2',
          text: 'How much of your coursework sits outside your major?',
          options: [
            { text: 'About half or more.', mapping: 'Strong', score: 2 },
            { text: 'Some, mostly required general education.', mapping: 'Partway', score: 1 },
            { text: 'Almost none. My program is packed.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'i3',
          text: 'In your classes, are you asked to defend a position and then attack it?',
          options: [
            { text: 'Often. Discussion, writing and open-ended problems are normal here.', mapping: 'Strong', score: 2 },
            { text: 'In one or two classes.', mapping: 'Partway', score: 1 },
            { text: 'Rarely. It is mostly lectures and tests.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'i4',
          text: 'Are you part of something on campus that meets regularly?',
          options: [
            { text: 'Yes, and I show up every week.', mapping: 'Strong', score: 2 },
            { text: 'I signed up for something but rarely go.', mapping: 'Partway', score: 1 },
            { text: 'Not yet.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'i5',
          text: 'Do you spend real time with people whose background or beliefs differ from yours?',
          options: [
            { text: 'Yes, regularly, and it has changed how I think.', mapping: 'Strong', score: 2 },
            { text: 'Sometimes, in class or group work.', mapping: 'Partway', score: 1 },
            { text: 'Not really. I stay with people like me.', mapping: 'Not yet', score: 0 }
          ]
        }
      ],
      optional: {
        text: 'One more, if you like. What is your situation?',
        note: 'Not scored. It reorders the advice so the usable part comes first.',
        options: [
          { text: "I'm at a big university", panel: 'bigu' },
          { text: 'I commute, work, or both', panel: 'commuter' },
          { text: 'My major leaves almost no free slots', panel: 'lockedmajor' },
          { text: 'I am struggling right now', panel: 'struggling' }
        ]
      },
      bands: [
        {
          min: 8, max: 10,
          profile: "You're getting the part that lasts",
          lead: 'Your answers put you in the group that, in the study, looked most like graduates who did well decades later. Keep it, and deepen one thing.',
          research: [
            'The experiences you already have are the ones most consistently linked to adult outcomes: faculty contact outside class, breadth, teaching that makes you think, campus involvement, and time with people unlike you.',
            'Graduates with a mentor whose influence lasted were 26% more likely to be leaders as adults. Graduates who took more than half their courses outside their major were 24% more likely to report higher incomes.'
          ],
          ask: [
            'Which professor here would still remember me in ten years, and have I given them a reason to?',
            'What is the most ambitious project I could ask someone to supervise?'
          ],
          check: [
            'Look at whether your college offers independent study, honors theses or paid summer research, and what the deadline is.'
          ],
          tryThis: 'Ask one professor to supervise an independent study or research project next term. Go with a one-paragraph idea, not an empty question.',
          otherResearch: 'Gallup and Purdue found that only 3% of 30,000 graduates strongly agreed they had had all six of the key supportive and hands-on experiences in college. If you have most of them, you are rare.'
        },
        {
          min: 4, max: 7,
          profile: "You're partway there",
          lead: 'You have some of it. The gap is usually one or two habits, and they are smaller than they look.',
          research: [
            'In the study, these experiences did not have to arrive all at once. Each one was independently linked to adult outcomes, so adding a single habit is worth doing on its own.',
            'Graduates who often talked with professors outside class about things other than coursework were 37% more likely to volunteer more as adults, and that conversation usually started with a question about the course.'
          ],
          ask: [
            'Which one of the five moves is missing for me right now?',
            'Who is the one professor I could go see this week?'
          ],
          check: [
            'Look up office hours for every course you are taking. Put one of them in your calendar.'
          ],
          tryThis: 'Go to office hours once with a real question: "Can you help me understand one thing from Tuesday?" That is the whole move.',
          otherResearch: 'Vincent Tinto found that students are more likely to stay and finish when they are connected to both the academic and the social life of a college.'
        },
        {
          min: 0, max: 3,
          profile: "You've got the classes. Here's the part nobody told you about.",
          lead: 'Nothing here is a judgment. Most students are never told that the part that lasts happens around the classroom, not only in it.',
          research: [
            'The study found that involvement with faculty and other students outside class was the experience most consistently linked to every kind of life outcome measured.',
            'These links were strongest for students from lower-income families, and they held for every kind of major, including engineering and professional programs.'
          ],
          ask: [
            'What is one class where I could ask the professor a question after the session ends?',
            'What is one group on campus that meets at a time I am already free?'
          ],
          check: [
            'Find your college\u2019s list of student organizations and pick one that meets weekly.'
          ],
          tryThis: 'Pick one move, not five. Stay two minutes after class this week and ask one question. That is the first move, and it is free.',
          otherResearch: 'Scott Freeman and colleagues reviewed 225 studies and found that students in traditional lectures were about 1.5 times as likely to fail as students in classes built on active learning. If your classes are passive, the work of staying engaged falls to you.'
        }
      ]
    },

    /* ============================== 3. PARENTS ============================== */
    'Parents': {
      audience: 'Parents',
      scoring: 'plurality',
      intro: {
        heading: 'What should this investment buy?',
        text: 'Five questions, plus one optional. Two minutes. There are no wrong answers. Every one of these hopes is reasonable.'
      },
      questions: [
        {
          id: 'p1',
          text: 'When you picture your child at 30, what matters most to you?',
          options: [
            { text: 'They can support themselves without worry.', mapping: 'Security' },
            { text: 'They are still growing, still curious, still becoming someone.', mapping: 'Growth' },
            { text: 'They are doing something they believe in.', mapping: 'Purpose' }
          ]
        },
        {
          id: 'p2',
          text: 'Which sentence would you most want to hear from them after first year?',
          options: [
            { text: '"I know what I am training for, and I am on track."', mapping: 'Security' },
            { text: '"I took a class I never expected to love."', mapping: 'Growth' },
            { text: '"I met a professor who made me think about what I am doing with my life."', mapping: 'Purpose' }
          ]
        },
        {
          id: 'p3',
          text: 'Which worry keeps you up at night?',
          options: [
            { text: 'That the money will not come back as a living.', mapping: 'Security' },
            { text: 'That they will coast through and come out unchanged.', mapping: 'Growth' },
            { text: 'That they will succeed at something that does not matter to them.', mapping: 'Purpose' }
          ]
        },
        {
          id: 'p4',
          text: 'When you compare colleges, what do you look at first?',
          options: [
            { text: 'Net price, graduation rate and what graduates earn.', mapping: 'Security' },
            { text: 'Class sizes, breadth of the curriculum and who teaches first-year courses.', mapping: 'Growth' },
            { text: 'Whether students and professors actually know one another.', mapping: 'Purpose' },
            { text: 'Honestly, I am not sure where to find those numbers.', mapping: null, panel: 'wherenumbers' }
          ]
        },
        {
          id: 'p5',
          text: 'If your child wanted to change their major in year two, your first reaction would be:',
          options: [
            { text: '"Let us check what that does to the cost and the timeline."', mapping: 'Security' },
            { text: '"Good. That means you are actually learning something about yourself."', mapping: 'Growth' },
            { text: '"Tell me what changed your mind."', mapping: 'Purpose' }
          ]
        }
      ],
      optional: {
        text: 'One more, if you like. What else is on your mind? Pick all that fit.',
        note: 'Not scored. It only adds advice to your result.',
        options: [
          { text: 'How we will pay for it', panel: 'payingparent' },
          { text: 'We are the first family in this', panel: 'firstgenparent' },
          { text: 'We will likely pay close to full price', panel: 'fullprice' },
          { text: 'Loans worry me', panel: 'loans' },
          { text: 'My child\u2019s well-being', panel: 'wellbeing' },
          { text: 'AI and whether jobs will still be there', panel: 'aijobs' },
          { text: 'Whether college is the right path at all', panel: 'altpaths' }
        ]
      },
      results: {
        'Security': {
          profile: 'Security first',
          lead: 'You want college to leave your child able to stand on their own. The evidence supports that goal, and points somewhere unexpected to reach it.',
          research: [
            'Specialized preparation helped graduates get a first job, but the advantage faded. Over a career, breadth did the work. Graduates who took more than half their courses outside their major were 24% more likely to report a higher income as adults.',
            'The effect was largest for the families with the least room for error: 33% for graduates from lower-income families and 34% for graduates with lower entrance test scores. Major was unrelated to longer-term success.'
          ],
          ask: [
            'What is our net price after grants, each year, through graduation?',
            'What share of students like mine graduate in four years here?',
            'Where are your graduates ten years out, not six months out?'
          ],
          check: [
            'Run the net price calculator on every college\u2019s site, including one private college you assumed was out of reach.',
            'Use collegescorecard.ed.gov for average cost at your income level and completion rates.'
          ],
          tryThis: 'Compare award letters on net price, which is cost minus free grants. Loans are not aid, they are cost moved later.',
          otherResearch: 'A 2026 survey of corporate recruiters found the skills weighed most in hiring were communication (64%), problem-solving (62%) and adaptability (60%).'
        },
        'Growth': {
          profile: 'Growth first',
          lead: 'You want college to change your child, not just credential them. The study says the things that do that are specific and askable.',
          research: [
            'Graduates who took small discussion classes in their first two years were 25% more likely to keep learning actively as adults and 37% more likely to stay involved with arts, ideas and other cultures.',
            'Graduates whose coursework often involved questions with no single right answer were 61% more likely to describe their lives as highly fulfilled.'
          ],
          ask: [
            'How many of my child\u2019s first-year classes will have fewer than 20 students?',
            'Who teaches first-year courses here?',
            'How much of the degree can be taken outside the major and still finish in four years?'
          ],
          check: [
            'Look up the class-size table in the college\u2019s Common Data Set, usually posted online.',
            'Add up the credits a major actually requires in the catalog. Over half the degree leaves little room.'
          ],
          tryThis: 'Ask for a real first-year syllabus. Look at whether the assignments have one right answer.',
          otherResearch: 'Ernest Pascarella and Patrick Terenzini concluded, after reviewing decades of research, that what students do in college matters far more than which college they attend.'
        },
        'Purpose': {
          profile: 'Purpose first',
          lead: 'You want your child to become someone others can count on. The study found that this comes largely from people, not programs.',
          research: [
            'Graduates whose professors mostly knew their first name were 67% more likely to describe their lives as highly fulfilled. Graduates with a mentor whose influence lasted were 26% more likely to be leaders as adults.',
            'Graduates closely involved with faculty and other students outside class were 56% more likely to give a larger share of their income and 42% more likely to volunteer.'
          ],
          ask: [
            'How many professors will know my child by name by the end of first year?',
            'How does a student here find a mentor, and who makes sure it happens?',
            'What share of students work closely with a faculty member on a project?'
          ],
          check: [
            'Ask to be put in touch with a current student by email. Ask them to name one adult on campus who knows them.',
            'Look at whether advising is assigned once, or revisited every year.'
          ],
          tryThis: 'Leave three questions with your child: What kind of person do you want to be at 30? What do you believe now that you would like a class to test? What would you study if jobs were not the first concern?',
          otherResearch: 'Gallup and Purdue found that graduates who had a professor who cared about them, made them excited about learning and encouraged their hopes were more than twice as likely to be engaged at work and thriving.'
        }
      }
    },

    /* ============================== 4. FACULTY ============================== */
    'Faculty': {
      audience: 'Faculty',
      scoring: 'points',
      intro: {
        heading: 'Which parts of your teaching show up thirty years later?',
        text: 'Five questions. Two minutes. This is for you, not for a review file.'
      },
      questions: [
        {
          id: 'f1',
          text: 'By week four of a typical course, how many students do you know by name?',
          options: [
            { text: 'Most of them.', mapping: 'Strong', score: 2 },
            { text: 'The ones who speak.', mapping: 'Partway', score: 1 },
            { text: 'Few or none.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'f2',
          text: 'Do you talk with students outside class about things other than the course?',
          options: [
            { text: 'Regularly, and with students who did not seek me out.', mapping: 'Strong', score: 2 },
            { text: 'Occasionally, usually when a student comes to me.', mapping: 'Partway', score: 1 },
            { text: 'Rarely. Office hours are mostly about grades.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'f3',
          text: 'In your last class meeting, who did most of the talking?',
          options: [
            { text: 'Students, for a substantial share of the time.', mapping: 'Strong', score: 2 },
            { text: 'Me, with some questions and discussion.', mapping: 'Partway', score: 1 },
            { text: 'Me, almost entirely.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'f4',
          text: 'Could two strong students answer your main assignments differently and both be right?',
          options: [
            { text: 'Yes. Open-ended work is central to the course.', mapping: 'Strong', score: 2 },
            { text: 'In one assignment or project.', mapping: 'Partway', score: 1 },
            { text: 'No. The work has one correct answer.', mapping: 'Not yet', score: 0 }
          ]
        },
        {
          id: 'f5',
          text: 'Are students required to argue against their own position?',
          options: [
            { text: 'Yes, it is built into assignments or discussion.', mapping: 'Strong', score: 2 },
            { text: 'Sometimes, informally.', mapping: 'Partway', score: 1 },
            { text: 'Not currently.', mapping: 'Not yet', score: 0 }
          ]
        }
      ],
      optional: {
        text: 'One more, if you like. What is your teaching situation?',
        note: 'Not scored. It reorders the adaptations so the usable ones come first.',
        options: [
          { text: 'Large lecture course', panel: 'largelecture' },
          { text: 'Mostly commuting or working students', panel: 'commuterstudents' },
          { text: 'Part-time or adjunct, no office', panel: 'adjunct' },
          { text: 'Science, engineering or mathematics', panel: 'stem' }
        ]
      },
      bands: [
        {
          min: 8, max: 10,
          profile: 'Your teaching is built on relationships',
          lead: 'What you already do is what the study found linked to graduates\u2019 adult lives. The useful question now is who else gets to do it.',
          research: [
            'Graduates whose professors mostly knew their first name were 67% more likely to describe their lives as highly fulfilled. Graduates made to examine the strengths and weaknesses of their own arguments were 149% more likely, the largest difference in that part of the study.',
            'These links were strongest for graduates from lower-income families, which means this teaching does the most for the students with the least.'
          ],
          ask: [
            'Which colleagues in my department carry most of the mentoring, and is it counted anywhere?',
            'What would it take to make one of these practices standard in our first-year courses?'
          ],
          check: [
            'Look at your department\u2019s tenure and promotion language. Does any of it describe what you actually do with students?'
          ],
          tryThis: 'Bring your completed self-audit to one department meeting. One colleague adopting one practice doubles the reach.',
          otherResearch: 'Studies of faculty workload find that women faculty do more of this kind of service than men, and faculty of color often describe extra mentoring demands, sometimes called cultural taxation. The work is rarely counted.'
        },
        {
          min: 4, max: 7,
          profile: 'You do some of this',
          lead: 'You already have part of it. The remaining practices are mostly changes in habit, not in workload.',
          research: [
            'Each of the five practices was independently linked to adult outcomes, so adding one is worth doing on its own.',
            'Graduates who took small discussion classes in their first two years were 25% more likely to keep learning actively and 37% more likely to stay involved with arts, ideas and other cultures.'
          ],
          ask: [
            'Which of the five practices is cheapest for me to add next term?',
            'What is actually stopping me: class size, room, time, or habit?'
          ],
          check: [
            'Time yourself for one class meeting. Note the minutes students speak.'
          ],
          tryThis: 'Add one line to every assignment: "State the strongest objection to your answer." It costs one sentence of preparation.',
          otherResearch: 'Scott Freeman and colleagues reviewed 225 studies in science, engineering and mathematics and found students in traditional lectures were about 1.5 times as likely to fail as students in active-learning classes.'
        },
        {
          min: 0, max: 3,
          profile: 'Your teaching is built on content',
          lead: 'Content is not the problem. The study simply found that what students carry for decades came from how they were taught, and from being known.',
          research: [
            'Graduates with a college mentor whose influence lasted were 26% more likely to be leaders as adults. Graduates who often talked with professors outside class about non-academic subjects were 37% more likely to volunteer more.',
            'Alexander Astin\u2019s study of about 25,000 students found student-faculty interaction among the strongest influences on how students develop.'
          ],
          ask: [
            'Whose names could I learn by week four if I used the photo roster?',
            'What is the one question I could open class with next week?'
          ],
          check: [
            'Look at your syllabus. Is there a single assignment two good students could answer differently?'
          ],
          tryThis: 'Start with names. It costs nothing, needs no office, works in any room, and in the study it was linked to a 67% greater likelihood of graduates describing their lives as highly fulfilled.',
          otherResearch: 'George Kuh found that high-impact practices such as first-year seminars, undergraduate research and writing-intensive courses benefited low-income and underrepresented students most.'
        }
      ]
    },

    /* =========================== 5. COLLEGE LEADERS =========================== */
    'College Leaders': {
      audience: 'College Leaders',
      scoring: 'plurality',
      intro: {
        heading: 'Your mission statement makes a promise. Does your budget keep it?',
        text: 'Five questions. Two minutes. Answer as your institution behaves, not as it describes itself.'
      },
      questions: [
        {
          id: 'l1',
          text: 'When you make the case to your board or donors, what do you lead with?',
          options: [
            { text: 'Job placement and starting salaries.', mapping: 'Market' },
            { text: 'Our mission and the kind of graduates we aim to produce.', mapping: 'Mission' },
            { text: 'What students experience here day to day.', mapping: 'Experience' }
          ]
        },
        {
          id: 'l2',
          text: 'If you had to cut 5% next year, what would be protected last?',
          options: [
            { text: 'Enrollment marketing and new programs with demand.', mapping: 'Market' },
            { text: 'The programs most tied to our identity.', mapping: 'Mission' },
            { text: 'Faculty time with students and small classes.', mapping: 'Experience' }
          ]
        },
        {
          id: 'l3',
          text: 'What do tenure and promotion reward most in practice?',
          options: [
            { text: 'Course load and enrollments.', mapping: 'Market' },
            { text: 'Research and teaching as each department defines them.', mapping: 'Mission' },
            { text: 'Teaching plus out-of-class mentoring and involvement with students.', mapping: 'Experience' }
          ]
        },
        {
          id: 'l4',
          text: 'What do you measure and report about graduates?',
          options: [
            { text: 'First-job placement and salary.', mapping: 'Market' },
            { text: 'Stories of notable alumni.', mapping: 'Mission' },
            { text: 'What students experienced, and how alumni are doing years later.', mapping: 'Experience' }
          ]
        },
        {
          id: 'l5',
          text: 'How much of a student\u2019s degree is designed to be taken outside the major?',
          options: [
            { text: 'Most often less than a third. Major requirements dominate, even where an accreditor does not require it.', mapping: 'Market' },
            { text: 'About a third, mostly through a general education checklist.', mapping: 'Mission' },
            { text: 'Half or more by design, or, in licensed programs, breadth built into the major through courses outside the major, ethics, writing and connections among fields.', mapping: 'Experience' }
          ]
        }
      ],
      results: {
        'Market': {
          profile: 'Market first',
          lead: 'Your institution responds to demand. That keeps the doors open. The risk is that the practices linked to graduates\u2019 lives are exactly the ones that are hardest to count, and therefore first to be cut.',
          research: [
            'In the study, specialized preparation helped graduates get a first job, but the advantage faded. Graduates who took more than half their courses outside their major were 24% more likely to report higher incomes as adults, and 33% among graduates from lower-income families.',
            'Major requirements that crowd out breadth therefore trade a short-term recruiting message against a long-term outcome you will eventually be measured on.'
          ],
          ask: [
            'What share of our degrees leave room for more than half the credits outside the major?',
            'Which of our recent program additions produced net new students rather than redistributed ones?'
          ],
          check: [
            'Run a registrar degree audit on credit distribution by program.',
            'Compare your NSSE items on faculty contact against your peer set.'
          ],
          tryThis: 'Add one retention line to the next program proposal template: what does this program do for students who are already here?',
          otherResearch: 'Vincent Tinto found students persist when connected to both the academic and the social life of an institution. George Kuh found high-impact practices tied to better grades and second-year return, with the largest benefits for low-income and underrepresented students. Every student who stays is tuition you do not have to replace.'
        },
        'Mission': {
          profile: 'Mission first',
          lead: 'Your institution leads with what it believes. The evidence can turn that belief into something measurable, which is what boards and legislators increasingly require.',
          research: [
            'The study found that involvement with faculty and other students outside class was the experience most consistently linked to every kind of adult outcome measured.',
            'Liberal arts colleges in the study were on average twice as likely to provide those six experiences. In a national Gallup study, 45% of graduates of colleges under 5,000 students said professors cared about them as a person, against 24% at larger institutions.'
          ],
          ask: [
            'Which sentence in our mission statement can we show evidence for?',
            'What do we measure that a trustee would recognize as proof?'
          ],
          check: [
            'Map each mission claim to one data source you already collect.'
          ],
          tryThis: 'Pick one mission promise and commit to reporting a number against it at the next board meeting.',
          otherResearch: 'Gallup and Purdue, surveying 30,000 graduates, found that only 3% strongly agreed they had had all six key supportive and hands-on experiences in college. The promise is common; delivery is not.'
        },
        'Experience': {
          profile: 'Experience first',
          lead: 'You already manage what the study says matters. The useful next question is coverage: which students get it, and which do not.',
          research: [
            'The links in the study were strongest for graduates from lower-income families, which means uneven delivery widens gaps rather than narrowing them.',
            'Graduates with a lasting mentor were 26% more likely to be leaders. Graduates closely involved with faculty and students outside class were 56% more likely to give a larger share of income and 42% more likely to volunteer.'
          ],
          ask: [
            'Which student populations are least likely to report a mentor?',
            'Who owns each of these practices, by name?'
          ],
          check: [
            'Disaggregate your engagement data by Pell status, commuter status and first-generation status.'
          ],
          tryThis: 'Use the Institutional Health Checklist on this page and assign one accountable owner per practice before the next cabinet meeting.',
          otherResearch: 'Kuh and colleagues studied 20 institutions outperforming their predicted graduation rates. Ursinus College required a two-semester Common Intellectual Experience of every first-year student. The University of Kansas made undergraduate teaching visible through awards and kept most undergraduate courses at 30 students or fewer.'
        }
      }
    },

    /* ============================ 6. POLICYMAKERS ============================ */
    'Policymakers': {
      audience: 'Policymakers',
      scoring: 'plurality',
      intro: {
        heading: 'What should the public be buying?',
        text: 'Five questions. Two minutes. Optional. If you would rather go straight to the brief, close this and use the tool below.'
      },
      questions: [
        {
          id: 'm1',
          text: 'What is the strongest argument for public investment in higher education?',
          options: [
            { text: 'A workforce employers can hire.', mapping: 'Workforce-First' },
            { text: 'Citizens who participate, give and lead.', mapping: 'Civic-First' },
            { text: 'An economy that can absorb change without leaving people behind.', mapping: 'Resilience-First' }
          ]
        },
        {
          id: 'm2',
          text: 'Which number would you most want in a committee report?',
          options: [
            { text: 'Job placement and earnings in the first years after graduation.', mapping: 'Workforce-First' },
            { text: 'Alumni volunteering, giving and community leadership.', mapping: 'Civic-First' },
            { text: 'Earnings at ten and twenty years, and mobility across occupations.', mapping: 'Resilience-First' }
          ]
        },
        {
          id: 'm3',
          text: 'A program passes the early-earnings test but graduates stall by year ten. Your response?',
          options: [
            { text: 'The test worked. Entry-level outcomes are what we can verify.', mapping: 'Workforce-First' },
            { text: 'Earnings were never the whole public return in the first place.', mapping: 'Civic-First' },
            { text: 'The test is too short. We need the long horizon in statute.', mapping: 'Resilience-First' }
          ]
        },
        {
          id: 'm4',
          text: 'Where would you put a marginal dollar?',
          options: [
            { text: 'Programs aligned to in-demand occupations.', mapping: 'Workforce-First' },
            { text: 'Access and completion for underserved students.', mapping: 'Civic-First' },
            { text: 'Faculty contact, advising and experiential learning that keep students enrolled.', mapping: 'Resilience-First' }
          ]
        },
        {
          id: 'm5',
          text: 'Which risk concerns you most over the next decade?',
          options: [
            { text: 'Skills gaps that stall employers.', mapping: 'Workforce-First' },
            { text: 'Declining civic participation and trust.', mapping: 'Civic-First' },
            { text: 'Graduates trained narrowly for work that changes under them.', mapping: 'Resilience-First' }
          ]
        }
      ],
      results: {
        'Workforce-First': {
          profile: 'Workforce first',
          lead: 'You want the public investment to produce employable graduates. The evidence agrees with the goal and complicates the method.',
          research: [
            'Specialized preparation helped graduates get a first job, but that advantage faded. Graduates who took more than half their credits outside their major were 24% more likely to report a higher income as adults.',
            'The effect was larger for the students public policy most intends to help: 33% for graduates from lower-income families and 34% for those entering with lower test scores.'
          ],
          ask: [
            'How will we know whether programs that pass the four-year earnings test serve graduates well at ten and twenty years?',
            'Do our data show how many students complete credits outside their major?'
          ],
          check: [
            'Compare your state wage-record horizon against the four-year federal threshold.'
          ],
          tryThis: 'Use the brief generator below to request ten-year earnings alongside the measures you already collect.',
          otherResearch: 'A 2026 survey of corporate recruiters found employers weigh communication (64%), problem-solving (62%) and adaptability (60%) most heavily in hiring.'
        },
        'Civic-First': {
          profile: 'Civic first',
          lead: 'You see the public return as citizenship, not only payroll. The study measured that directly.',
          research: [
            'Graduates closely involved with faculty and other students outside class were 56% more likely to give a larger share of their income to nonprofits and 42% more likely to volunteer.',
            'An honest limit: voting was not linked to the college experiences measured. Giving and volunteering were.'
          ],
          ask: [
            'Does any state report include alumni volunteering or giving?',
            'Which state or federal programs pay for faculty contact and campus involvement for low-income students, and what is happening to their funding?'
          ],
          check: [
            'Review whether your state alumni survey, if any, asks about civic behavior.'
          ],
          tryThis: 'Add one civic measure to the brief below, so the civic return has a number next to the earnings number.',
          otherResearch: 'George Kuh found service learning and related practices tied to better grades and second-year persistence, with the largest benefits for underrepresented and low-income students.'
        },
        'Resilience-First': {
          profile: 'Resilience first',
          lead: 'You are measuring a working life, not an entry point. That is where the evidence is strongest.',
          research: [
            'Americans now in their early forties had already held an average of 9.4 jobs by age 38, about twenty years into their working lives, according to the Bureau of Labor Statistics.',
            'The World Economic Forum expects nearly 40% of the skills used at work to change by 2030. In the study, breadth, faculty contact and teaching that made students think were linked to adult income and to leadership, civic involvement, continued learning and fulfillment.'
          ],
          ask: [
            'What is the longest horizon in our current accountability statute, and what would it cost to extend it?',
            'Do we fund the practices linked to completion, or only the credentials linked to current demand?'
          ],
          check: [
            'Check whether your state participates in multi-state wage data exchanges that extend the earnings horizon.'
          ],
          tryThis: 'Use the model report-request language in the brief below. It adds a long horizon without discarding the measures you already have.',
          otherResearch: 'Stacy Dale and Alan Krueger, tracking earnings for more than 20 years, found the effect of attending a more selective college fell close to zero once students\u2019 own abilities and ambitions were accounted for. Raj Chetty, David Deming and John Friedman found Ivy-Plus attendance raised the odds of reaching the top 1%, while the average effect across all graduates was small and not statistically significant.'
        }
      }
    }
  };

  /* ------------------------------------------------------------------------
     3. OPTIONAL ADVICE PANEL LIBRARY
     Injected directly beneath the result heading when selected.
     ------------------------------------------------------------------------ */
  var PANELS = {
    /* Choosing a College */
    paying: {
      title: 'Paying for it',
      body: '<p>The price on the website is not the price most students pay. At private nonprofit colleges, about 9 in 10 first-year students receive grants from the college itself, and on average those grants cover more than half of published tuition.</p><p>Run the net price calculator on each college\u2019s own site, and check cost at your income level on <strong>collegescorecard.ed.gov</strong>. File the FAFSA at <strong>studentaid.gov</strong> as soon as it opens in the fall of senior year.</p>'
    },
    firstgen: {
      title: 'First in your family',
      body: '<p>You are not behind. Tell your school counselor this year: "I want to go to college, and I am the first in my family. What should I be doing now?" Ask about application and test fee waivers. Try three net price calculators, including one private college you assumed was too expensive. File the FAFSA early, because some aid runs out.</p>'
    },
    belonging: {
      title: 'Belonging, and finishing',
      body: '<p>Vincent Tinto found that students are more likely to stay and finish when they are connected to both the academic and the social life of a college. Ask each college what share of students <em>like you</em> graduate, and what support exists in the first six weeks, when most students who leave decide to.</p>'
    },
    gettingin: {
      title: 'Getting in',
      body: '<p>Worth knowing: in 2023, 88% of Fortune 100 chief executives had not attended an Ivy League college as undergraduates. Dale and Krueger tracked earnings for more than 20 years and found the effect of attending a more selective college fell close to zero once students\u2019 own abilities and ambitions were accounted for. Build a list with affordable probables, matches and reaches.</p>'
    },
    firstchoice: {
      title: 'If it is not your first choice',
      body: '<p>The study found that what students <em>did</em> in college mattered more than which college they attended. The five experiences on this site are available at every kind of institution. At larger or less personal places you may have to seek them out, through honors programs, office hours and campus involvement, but they are there.</p>'
    },

    /* In College */
    bigu: {
      title: 'At a big university',
      body: '<p>Start with your TA, who is often the bridge to the professor. Go to office hours in the first weeks before lines form. Look for honors sections, research programs and small seminars, which are where the small-college experience lives inside a large university.</p>'
    },
    commuter: {
      title: 'If you commute or work',
      body: '<p>Stay two minutes after class, or email one thoughtful question. Ask for a five-minute video check-in. For involvement, choose one group that meets at a time you are already on campus. Consistency beats volume.</p>'
    },
    lockedmajor: {
      title: 'If your major leaves no free slots',
      body: '<p>Use your required general education courses deliberately instead of treating them as a checklist. One well-chosen requirement a term is still breadth. In the study, these links held for every kind of major, including engineering and professional programs.</p>'
    },
    struggling: {
      title: 'If you are struggling right now',
      body: '<p>Three things, in order. Tell one professor or adviser this week: "I am struggling this term and I do not want to fall behind. What are my options?" Use tutoring, which is free at almost every college. And protect your credits: dropping one class before the deadline is far better than failing three. Talk to financial aid before withdrawing from anything.</p>'
    },

    /* Parents */
    wherenumbers: {
      title: 'Where to find the numbers',
      body: '<p><strong>Net price calculator:</strong> on every college\u2019s own website, by law. <strong>collegescorecard.ed.gov:</strong> average cost at your income level, completion rates and earnings. <strong>studentaid.gov:</strong> the FAFSA. <strong>Common Data Set:</strong> search the college name plus "Common Data Set" for class sizes, retention and who teaches.</p>'
    },
    payingparent: {
      title: 'Paying for it',
      body: '<p>Most families pay less than the published price. At private nonprofit colleges, about 9 in 10 first-year students get grants from the college, covering on average more than half of published tuition. Compare award letters on net price, which is cost minus free grants, not cost minus loans.</p>'
    },
    firstgenparent: {
      title: 'First family through',
      body: '<p>Junior year: talk with the school counselor and try three net price calculators together. Summer: build a balanced list and ask about fee waivers. Fall of senior year: file the FAFSA as soon as it opens. Spring: compare awards side by side on net price.</p>'
    },
    fullprice: {
      title: 'If you will pay close to full price',
      body: '<p>Ask what the money buys that a cheaper option does not: class sizes, who teaches first-year courses, how many professors will know your child, and what share of students complete research or internships with funding attached. Those are the things linked to outcomes decades later.</p>'
    },
    loans: {
      title: 'About loans, honestly',
      body: '<p>Keep total student borrowing below what your child expects to earn in their first year of work. Use federal Direct Loans before private loans, because of fixed rates and income-driven repayment. And note that a college where students finish in four years often costs less than a cheaper one where they take six.</p>'
    },
    wellbeing: {
      title: 'Well-being',
      body: '<p>Ask what the counseling wait time is in October, not in June. Ask who notices when a student stops attending. Tinto\u2019s work ties persistence to connection, and connection is also what protects students who are struggling.</p>'
    },
    aijobs: {
      title: 'AI and whether the jobs will be there',
      body: '<p>The World Economic Forum expects nearly 40% of the skills used at work to change by 2030. A 2026 survey of corporate recruiters found employers weigh communication, problem-solving and adaptability most heavily in hiring. Those are what a broad education builds, and they are the parts hardest to automate.</p>'
    },
    altpaths: {
      title: 'Other paths',
      body: '<p>Starting at a community college and transferring can cut degree costs substantially; verify articulation agreements in advance. Apprenticeships, trade certifications and military benefits are real routes. The questions on this site apply to any institution along any of these paths.</p>'
    },

    /* Faculty */
    largelecture: {
      title: 'In a large lecture',
      body: '<p>Use the photo roster, learn the names of students who speak, and use a name every time you call on someone. Hold small-group office hours for eight to ten students at a time. Pose a question, have students answer, discuss with a neighbor, then answer again.</p>'
    },
    commuterstudents: {
      title: 'With commuting and working students',
      body: '<p>Arrive five minutes early and greet students by name as they come in. Offer video office hours and early or late times. Build the reading into class: read a short passage together and discuss it, rather than assuming it was done at home.</p>'
    },
    adjunct: {
      title: 'Teaching part-time, without an office',
      body: '<p>Names cost nothing and need no office. So does one question at the start of class, and one added line on every assignment. Ask the department for a space to meet students; it is a reasonable request and it is the main structural barrier.</p>'
    },
    stem: {
      title: 'In science, engineering and mathematics',
      body: '<p>Set a design problem, or ask students to explain why their approach is better than another that also works. Add: "Where could this calculation or design go wrong?" Freeman and colleagues, reviewing 225 studies, found students in traditional lectures about 1.5 times as likely to fail as those in active-learning classes.</p>'
    }
  };

  /* ------------------------------------------------------------------------
     4. QUIZ STATE
     ------------------------------------------------------------------------ */
  var state = {
    audience: null,
    quiz: null,
    phase: 'questions',   // questions | optional | tiebreak | results
    index: 0,
    answers: [],          // { mapping, score, optionIndex, panel }
    optionalPanels: [],
    tieWinner: null,
    advancing: false,
    advanceTimer: null
  };
  var quizReturnFocus = null;

  function el(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function tiedResultsHtml(keys, message) {
    var html = '<p class="section-label">Your results</p>' +
      '<p style="font-size:1.05rem;color:var(--text-charcoal);margin-bottom:1.5rem;">' + esc(message) + '</p>' +
      panelsHtml();
    keys.forEach(function (key, i) {
      if (i > 0) html += '<hr style="margin:2.5rem 0;border:none;border-top:1px solid var(--border-muted);">';
      html += resultBlockHtml(state.quiz.results[key], { skipPanels: true });
    });
    return html;
  }

  function honestyHtml() {
    return '<p class="quiz-honesty">This study looked at graduates\u2019 adult lives and the college experiences linked to life outcomes. The results held for graduates of all types of colleges, big and small, private and public, prestigious and not. The Research page explains what the study can and cannot show.</p>';
  }

  function quizSummaryText() {
    var q = state.quiz;
    if (!q) return '';
    var keys;
    if (q.scoring === 'points') {
      keys = [bandFor(totalPoints())];
    } else if (q.scoring === 'outcome') {
      keys = state.tieWinner ? [q.results[state.tieWinner]] : topKeys(tally()).map(function (key) { return q.results[key]; });
    } else {
      keys = topKeys(tally()).map(function (key) { return q.results[key]; });
    }

    var lines = ['What College Is Really For — ' + q.audience];
    state.answers.forEach(function (answer, index) {
      var question = q.questions[index];
      if (!answer || !question) return;
      lines.push('', question.text, 'Answer: ' + question.options[answer.optionIndex].text);
    });
    if (state.tieWinner && q.tieBreaker) {
      var tieOption = q.tieBreaker.options.find(function (option) { return option.mapping === state.tieWinner; });
      if (tieOption) lines.push('', q.tieBreaker.text, 'Answer: ' + tieOption.text);
    }
    keys.forEach(function (result) {
      if (!result) return;
      lines.push('', result.profile, result.lead);
      (result.ask || []).forEach(function (item) { lines.push('Question: ' + item); });
      (result.check || []).forEach(function (item) { lines.push('Check: ' + item); });
      if (result.tryThis) lines.push('Try this one thing: ' + result.tryThis);
    });
    lines.push('', 'This study looked at graduates\u2019 adult lives and the college experiences linked to life outcomes. Read The Research page for what the study can and cannot show.');
    return lines.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    document.body.removeChild(textarea);
    return copied ? Promise.resolve() : Promise.reject(new Error('Clipboard access was denied.'));
  }

  /* ------------------------------------------------------------------------
     5. QUIZ RENDERING ENGINE
     ------------------------------------------------------------------------ */

  // Builds the modal if a page does not already contain it.
  function ensureQuizDom() {
    if (el('quiz-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.innerHTML =
      '<div id="quiz-modal" role="dialog" aria-modal="true" aria-label="Quiz">' +
        '<button class="quiz-close" aria-label="Close quiz" onclick="window.closeQuizModal()">&times;</button>' +
        '<div class="quiz-progress-container"><div id="quiz-progress-bar" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div></div>' +
        '<div id="quiz-content"></div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function totalSteps() {
    var n = state.quiz.questions.length;
    if (state.quiz.optional) n += 1;
    return n;
  }

  function completedSteps() {
    if (state.phase === 'results') return totalSteps();
    if (state.phase === 'tiebreak') return totalSteps();
    if (state.phase === 'optional') return state.quiz.questions.length;
    return state.index;
  }

  function setProgress() {
    var bar = el('quiz-progress-bar');
    if (!bar) return;
    var pct = Math.round((completedSteps() / totalSteps()) * 100);
    bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Quiz progress');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(pct));
  }

  function backButtonHtml(enabled) {
    return '<button class="quiz-btn" onclick="window.prevQuizStep()"' +
      (enabled ? '' : ' disabled') + '>Back</button>';
  }

  function renderQuestion() {
    var q = state.quiz.questions[state.index];
    var chosen = state.answers[state.index];
    var html = '';

    html += '<p class="section-label">' + esc(state.quiz.audience) + '</p>';
    html += '<p class="quiz-question-text">' + esc(q.text) + '</p>';
    html += '<p class="quiz-instruction">Pick the answer that is true for you, even if it is not the one you think you should pick.</p>';
    html += '<div class="quiz-options-list">';
    q.options.forEach(function (opt, i) {
      var sel = (chosen && chosen.optionIndex === i) ? ' selected' : '';
      html += '<div class="quiz-option' + sel + '" role="button" tabindex="0" ' +
        'aria-pressed="' + (sel ? 'true' : 'false') + '" ' +
        'onclick="window.selectQuizOption(' + i + ')" ' +
        'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();window.selectQuizOption(' + i + ');}">' +
        esc(opt.text) + '</div>';
    });
    html += '</div>';
    html += '<div class="quiz-nav">' + backButtonHtml(state.index > 0) +
      '<span style="font-size:.9rem;color:var(--text-muted);">Question ' +
      (state.index + 1) + ' of ' + state.quiz.questions.length + '</span></div>';

    el('quiz-content').innerHTML = html;
    setProgress();
    focusFirstQuizControl();
  }

  function renderOptional() {
    var o = state.quiz.optional;
    var html = '';
    html += '<p class="section-label">' + esc(state.quiz.audience) + '</p>';
    html += '<p class="quiz-question-text">' + esc(o.text) + '</p>';
    html += '<p style="font-size:.92rem;color:var(--text-muted);margin-top:-1rem;margin-bottom:1.25rem;">' + esc(o.note) + '</p>';
    html += '<div class="quiz-options-list">';
    o.options.forEach(function (opt, i) {
      var sel = state.optionalPanels.indexOf(opt.panel) > -1 ? ' selected' : '';
      html += '<div class="quiz-option' + sel + '" role="checkbox" tabindex="0" aria-checked="' +
        (sel ? 'true' : 'false') + '" ' +
        'onclick="window.toggleOptionalPanel(' + i + ')" ' +
        'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();window.toggleOptionalPanel(' + i + ');}">' +
        esc(opt.text) + '</div>';
    });
    html += '</div>';
    html += '<div class="quiz-nav">' + backButtonHtml(true) +
      '<button class="quiz-btn" style="background:var(--accent-gold);border-color:var(--accent-gold);color:var(--primary-navy);" onclick="window.showQuizResults()">See my result</button></div>';

    el('quiz-content').innerHTML = html;
    setProgress();
    focusFirstQuizControl();
  }

  function renderTieBreak(tied) {
    var tb = state.quiz.tieBreaker;
    var opts = tb.options.filter(function (o) { return tied.indexOf(o.mapping) > -1; });
    var html = '';
    html += '<p class="section-label">One more question</p>';
    html += '<p class="quiz-question-text">' + esc(tb.text) + '</p>';
    html += '<div class="quiz-options-list">';
    opts.forEach(function (opt) {
      html += '<div class="quiz-option" role="button" tabindex="0" ' +
        'onclick="window.resolveTie(\'' + opt.mapping + '\')" ' +
        'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();window.resolveTie(\'' + opt.mapping + '\');}">' +
        esc(opt.text) + '</div>';
    });
    html += '</div>';
    html += '<div class="quiz-nav">' + backButtonHtml(true) + '<span></span></div>';
    el('quiz-content').innerHTML = html;
    setProgress();
    focusFirstQuizControl();
  }

  function focusFirstQuizControl() {
    var control = el('quiz-content') && el('quiz-content').querySelector('.quiz-option, .quiz-actions button');
    if (control) control.focus();
  }

  function renderCurrent() {
    if (state.phase === 'questions') return renderQuestion();
    if (state.phase === 'optional') return renderOptional();
  }

  /* ------------------------------------------------------------------------
     6. RESULT RENDERING
     ------------------------------------------------------------------------ */

  function tally() {
    var counts = {};
    state.answers.forEach(function (a) {
      if (!a || !a.mapping) return;       // unscored options are skipped
      counts[a.mapping] = (counts[a.mapping] || 0) + 1;
    });
    return counts;
  }

  function topKeys(counts) {
    var max = -1, keys = [];
    Object.keys(counts).forEach(function (k) {
      if (counts[k] > max) { max = counts[k]; keys = [k]; }
      else if (counts[k] === max) { keys.push(k); }
    });
    return keys;
  }

  function shuffleOptions(options) {
    var shuffled = options.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var option = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = option;
    }
    return shuffled;
  }

  function totalPoints() {
    return state.answers.reduce(function (sum, a) {
      return sum + (a && typeof a.score === 'number' ? a.score : 0);
    }, 0);
  }

  function bandFor(points) {
    var bands = state.quiz.bands;
    for (var i = 0; i < bands.length; i++) {
      if (points >= bands[i].min && points <= bands[i].max) return bands[i];
    }
    return bands[bands.length - 1];
  }

  function panelsHtml() {
    var keys = state.optionalPanels.slice();
    // panels triggered by an unscored in-question option
    state.answers.forEach(function (a) {
      if (a && a.panel && keys.indexOf(a.panel) === -1) keys.push(a.panel);
    });
    if (!keys.length) return '';
    var html = '<div style="margin:1.75rem 0;">';
    keys.forEach(function (k) {
      var p = PANELS[k];
      if (!p) return;
      html += '<div style="background:var(--accent-gold-light);border-left:4px solid var(--accent-gold);border-radius:0 8px 8px 0;padding:1.15rem 1.25rem;margin-bottom:1rem;">' +
        '<h4 style="margin-bottom:.5rem;font-size:1.05rem;">' + esc(p.title) + '</h4>' +
        p.body + '</div>';
    });
    html += '</div>';
    return html;
  }

  function listHtml(title, items) {
    if (!items || !items.length) return '';
    var html = '<h3 style="font-size:1.2rem;margin-top:1.75rem;">' + esc(title) + '</h3><ul style="padding-left:1.25rem;display:flex;flex-direction:column;gap:.5rem;">';
    items.forEach(function (i) { html += '<li>' + i + '</li>'; });
    return html + '</ul>';
  }

  function resultBlockHtml(r, opts) {
    opts = opts || {};
    var html = '';
    html += '<p class="section-label">Your result</p>';
    html += '<h2 class="result-profile">' + esc(r.profile) + '</h2>';
    html += '<p class="result-description">' + esc(r.lead) + '</p>';

    if (!opts.skipPanels) html += panelsHtml();

    html += '<div class="result-insight"><h3 style="font-size:1.2rem;">What the research found</h3>';
    (r.research || []).forEach(function (p) { html += '<p>' + p + '</p>'; });
    html += '</div>';

    html += listHtml('Ask these out loud', r.ask);
    html += listHtml('Check it without asking anyone', r.check);

    if (r.tryThis) {
      html += '<div style="background:var(--bg-surface-alt);border-left:4px solid var(--primary-navy);padding:1.15rem 1.25rem;margin:1.75rem 0;">' +
        '<strong style="color:var(--primary-navy);">Try this one thing:</strong><p style="margin:.5rem 0 0;">' + r.tryThis + '</p></div>';
    }

    // Collapsed by default, per the phone-first rules
    if (r.otherResearch) {
      html += '<details class="accordion-item"><summary>Other research agrees</summary>' +
        '<div class="accordion-content"><p>' + r.otherResearch + '</p></div></details>';
    }

    if (r.quotes && r.quotes.length) {
      html += '<blockquote class="result-quote">' + esc(r.quotes[0].text) +
        '<cite>\u2014 ' + esc(r.quotes[0].cite) + '</cite></blockquote>';
      if (r.quotes.length > 1) {
        html += '<details class="accordion-item"><summary>In their own words</summary><div class="accordion-content">';
        r.quotes.slice(1).forEach(function (q) {
          html += '<blockquote class="result-quote">' + esc(q.text) +
            '<cite>\u2014 ' + esc(q.cite) + '</cite></blockquote>';
        });
        html += '</div></details>';
      }
    }
    return html;
  }

  function meaningfulLifeHtml() {
    return '<details class="accordion-item"><summary>A meaningful life in a world of change</summary>' +
      '<div class="accordion-content">' +
      '<p>Americans now in their early forties had already held an average of <strong>9.4 jobs by age 38</strong>, about twenty years into their working lives, according to the Bureau of Labor Statistics. The World Economic Forum expects nearly 40% of the skills used at work to change by 2030.</p>' +
      '<p>In the study behind this site, the same experiences were linked to higher adult income <em>and</em> to leadership, civic involvement, continued learning, cultural involvement and fulfillment. What lasts is not the first credential. It is the capacity to keep learning.</p>' +
      '</div></details>';
  }

  function howToReadHtml() {
    return '<details class="accordion-item"><summary>How to read these numbers</summary>' +
      '<div class="accordion-content"><p>A figure such as "24% more likely" compares two groups. If 57% of one group reports a higher income against 46% of another, the first group\u2019s rate is 124% of the second. Statisticians call this the incident risk ratio, and the increase expressed as a percentage is the percent relative effect.</p>' +
      '<p>The study interviewed people once and asked them to look back. It shows an association between experiences and outcomes, not a causal relationship. <a href="the-research.html">Read the full methodology.</a></p></div></details>';
  }

  function renderResults() {
    state.phase = 'results';
    var q = state.quiz;
    var html = '';

    if (q.scoring === 'points') {
      var pts = totalPoints();
      var band = bandFor(pts);
      html += '<p style="font-size:.9rem;color:var(--text-muted);margin-bottom:.25rem;">Score: ' + pts + ' of 10</p>';
      html += resultBlockHtml(band);
    } else if (q.scoring === 'outcome') {
      var outcomeKeys = state.tieWinner ? [state.tieWinner] : topKeys(tally());
      if (outcomeKeys.length > 1) {
        html += tiedResultsHtml(outcomeKeys, 'Your answers split evenly. Both of these results describe what you want from college.');
      } else {
        html += resultBlockHtml(q.results[outcomeKeys[0]]);
      }
    } else { // plurality
      var tied = topKeys(tally());
      if (tied.length > 1) {
        html += tiedResultsHtml(tied, 'Your answers split evenly. Each of these results describes a priority your institution holds.');
      } else {
        html += resultBlockHtml(q.results[tied[0]]);
      }
    }

    html += meaningfulLifeHtml();
    html += howToReadHtml();
    html += honestyHtml();

    html += '<div class="quiz-actions" style="margin-top:2rem;">' +
      '<button class="quiz-btn" onclick="window.retakeQuiz()">Retake the quiz</button>' +
      '<button class="quiz-btn" onclick="window.copyQuizQuestions(this)">Copy my questions</button>' +
      '<button class="quiz-btn" onclick="window.emailQuizQuestions()">Email this to me</button>' +
      '<button class="quiz-btn" style="background:var(--primary-navy);color:#fff;" onclick="window.closeQuizModal()">Close and use the tool</button>' +
      '</div>';

    el('quiz-content').innerHTML = html;
    el('quiz-content').scrollTop = 0;
    var modal = el('quiz-modal');
    if (modal) modal.scrollTop = 0;
    setProgress();
    focusFirstQuizControl();
  }

  /* ------------------------------------------------------------------------
     7. GLOBAL WINDOW BINDINGS
     Inline onclick handlers in the HTML depend on these names.
     ------------------------------------------------------------------------ */

  window.initQuiz = function (audienceName) {
    var quiz = QUIZ_DATA[audienceName];
    if (!quiz) {
      console.warn('[WCIRF] No quiz found for audience: "' + audienceName + '". Check the data-audience attribute.');
      return;
    }
    ensureQuizDom();
    state.audience = audienceName;
    state.quiz = Object.assign({}, quiz, {
      questions: quiz.questions.map(function (question) {
        return Object.assign({}, question, { options: shuffleOptions(question.options) });
      })
    });
    if (quiz.tieBreaker) {
      state.quiz.tieBreaker = Object.assign({}, quiz.tieBreaker, {
        options: shuffleOptions(quiz.tieBreaker.options)
      });
    }
    state.phase = 'questions';
    state.index = 0;
    state.answers = [];
    state.optionalPanels = [];
    state.tieWinner = null;
    state.advancing = false;
    state.advanceTimer = null;

    quizReturnFocus = document.activeElement;
    var overlay = el('quiz-overlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCurrent();
  };

  window.selectQuizOption = function (optionIndex) {
    if (state.advancing) return;
    var q = state.quiz.questions[state.index];
    var opt = q.options[optionIndex];

    state.answers[state.index] = {
      optionIndex: optionIndex,
      mapping: (typeof opt.mapping === 'undefined') ? null : opt.mapping,
      score: (typeof opt.score === 'number') ? opt.score : null,
      panel: opt.panel || null
    };

    // visual confirmation, then auto-advance
    var nodes = document.querySelectorAll('#quiz-content .quiz-option');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.remove('selected');
      nodes[i].setAttribute('aria-pressed', 'false');
    }
    if (nodes[optionIndex]) {
      nodes[optionIndex].classList.add('selected');
      nodes[optionIndex].setAttribute('aria-pressed', 'true');
    }

    state.advancing = true;
    state.advanceTimer = setTimeout(function () {
      state.advancing = false;
      state.advanceTimer = null;
      if (state.index < state.quiz.questions.length - 1) {
        state.index++;
        renderQuestion();
      } else if (state.quiz.optional) {
        state.phase = 'optional';
        renderOptional();
      } else {
        window.showQuizResults();
      }
    }, CONFIG.AUTO_ADVANCE_MS);
  };

  window.toggleOptionalPanel = function (i) {
    var key = state.quiz.optional.options[i].panel;
    var pos = state.optionalPanels.indexOf(key);
    if (pos > -1) state.optionalPanels.splice(pos, 1);
    else state.optionalPanels.push(key);
    renderOptional();
  };

  window.prevQuizStep = function () {
    if (state.advanceTimer !== null) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
      state.advancing = false;
    }
    if (state.phase === 'results') {
      state.phase = state.quiz.optional ? 'optional' : 'questions';
      if (state.phase === 'optional') return renderOptional();
      state.index = state.quiz.questions.length - 1;
      return renderQuestion();
    }
    if (state.phase === 'tiebreak') {
      state.phase = state.quiz.optional ? 'optional' : 'questions';
      if (state.phase === 'optional') return renderOptional();
      state.index = state.quiz.questions.length - 1;
      return renderQuestion();
    }
    if (state.phase === 'optional') {
      state.phase = 'questions';
      state.index = state.quiz.questions.length - 1;
      return renderQuestion();
    }
    if (state.index > 0) { state.index--; renderQuestion(); }
  };

  window.showQuizResults = function () {
    // Outcome quizzes with three or more tied outcomes get a bonus question.
    if (state.quiz.scoring === 'outcome' && !state.tieWinner) {
      var tied = topKeys(tally());
      if (tied.length >= 3 && state.quiz.tieBreaker) {
        state.phase = 'tiebreak';
        return renderTieBreak(tied);
      }
    }
    renderResults();
  };

  window.resolveTie = function (mapping) {
    state.tieWinner = mapping;
    renderResults();
  };

  window.retakeQuiz = function () {
    var a = state.audience;
    window.closeQuizModal();
    setTimeout(function () { window.initQuiz(a); }, 180);
  };

  window.closeQuizModal = function () {
    if (state.advanceTimer !== null) {
      clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
      state.advancing = false;
    }
    var overlay = el('quiz-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (quizReturnFocus && document.contains(quizReturnFocus)) quizReturnFocus.focus();
  };

  window.copyQuizQuestions = function (button) {
    copyText(quizSummaryText()).then(function () {
      if (button) {
        var previousText = button.textContent;
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = previousText; }, 1800);
      }
    }, function (error) {
      console.error('[WCIRF] Could not copy quiz results.', error);
      if (button) button.textContent = 'Copy failed';
    });
  };

  window.emailQuizQuestions = function () {
    var subject = 'My college questions from What College Is Really For';
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(quizSummaryText());
  };

  /* Legacy aliases, so older markup keeps working */
  window.closeQuiz = window.closeQuizModal;
  window.selectOption = function (mappingOrIndex, index) {
    window.selectQuizOption(typeof index === 'number' ? index : mappingOrIndex);
  };
  window.nextStep = function () { /* auto-advance replaces this */ };
  window.prevStep = window.prevQuizStep;
  window.showResults = window.showQuizResults;
  window.renderStep = function () { renderCurrent(); };

  /* ------------------------------------------------------------------------
     8. NAVIGATION, DROPDOWNS, ACCORDIONS
     ------------------------------------------------------------------------ */

  function initNav() {
    var toggle = el('mobile-menu');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    function setIcon(open) {
      var icon = toggle.querySelector('i');
      if (icon) {
        icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        return;
      }
      var symbol = toggle.querySelector('span[aria-hidden="true"]');
      if (symbol) symbol.textContent = open ? '\u00d7' : '\u2630';
    }

    function toggleMenu() {
      var open = links.classList.toggle('active');
      setIcon(open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', toggleMenu);

    // Touch-friendly dropdown
    var dropdowns = document.querySelectorAll('.dropdown');
    Array.prototype.forEach.call(dropdowns, function (dd) {
      var btn = dd.querySelector('.dropbtn');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          var open = dd.classList.toggle('active');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      });
      dd.addEventListener('mouseenter', function () {
        if (window.innerWidth > 768) btn.setAttribute('aria-expanded', 'true');
      });
      dd.addEventListener('mouseleave', function () {
        if (window.innerWidth > 768) btn.setAttribute('aria-expanded', 'false');
      });
      dd.addEventListener('focusin', function () {
        btn.setAttribute('aria-expanded', 'true');
      });
      dd.addEventListener('focusout', function (e) {
        if (!dd.contains(e.relatedTarget)) {
          btn.setAttribute('aria-expanded', 'false');
          if (window.innerWidth <= 768) dd.classList.remove('active');
        }
      });
    });

    function closeDropdown(dd) {
      dd.classList.remove('active');
      var btn = dd.querySelector('.dropbtn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!links.contains(e.target) && !toggle.contains(e.target)) {
        if (links.classList.contains('active')) {
          links.classList.remove('active');
          setIcon(false);
          toggle.setAttribute('aria-expanded', 'false');
        }
        Array.prototype.forEach.call(dropdowns, closeDropdown);
      }
    });

    // Reset on resize back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        links.classList.remove('active');
        setIcon(false);
        Array.prototype.forEach.call(dropdowns, closeDropdown);
      }
    });
  }

  function initAccordions() {
    // Native <details> handles open/close. This only keeps ARIA honest.
    var items = document.querySelectorAll('details.accordion-item');
    Array.prototype.forEach.call(items, function (d) {
      var s = d.querySelector('summary');
      if (!s) return;
      s.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      d.addEventListener('toggle', function () {
        s.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      });
    });
  }

  function initScorecardTabs() {
    var table = el('scorecard-table');
    var container = document.querySelector('.scorecard-table-container');
    var compare = el('scorecard-compare');
    var tabs = document.querySelectorAll('[data-scorecard-col]');
    if (!table || !container || !compare || !tabs.length) return;

    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        table.setAttribute('data-active-col', tab.getAttribute('data-scorecard-col'));
        table.removeAttribute('data-show-all');
        container.classList.remove('scorecard-compare-mode');
        compare.setAttribute('aria-expanded', 'false');
        Array.prototype.forEach.call(tabs, function (item) {
          item.setAttribute('aria-pressed', item === tab ? 'true' : 'false');
        });
      });
    });

    var collegeNameInputs = table.querySelectorAll('[data-scorecard-name]');
    Array.prototype.forEach.call(collegeNameInputs, function (input) {
      function updateTabName() {
        var tab = document.querySelector('[data-scorecard-col="' + input.getAttribute('data-scorecard-name') + '"] span');
        if (tab) tab.textContent = input.value.trim() || 'College ' + input.getAttribute('data-scorecard-name');
      }
      input.addEventListener('input', updateTabName);
      input.addEventListener('change', updateTabName);
      updateTabName();
    });

    compare.addEventListener('click', function () {
      var showAll = table.getAttribute('data-show-all') !== 'true';
      if (showAll) {
        table.setAttribute('data-show-all', 'true');
        container.classList.add('scorecard-compare-mode');
      } else {
        table.removeAttribute('data-show-all');
        container.classList.remove('scorecard-compare-mode');
      }
      compare.setAttribute('aria-expanded', showAll ? 'true' : 'false');
    });
  }

  function initModalDismiss() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var overlay = el('quiz-overlay');
        if (overlay && overlay.classList.contains('active')) window.closeQuizModal();
        return;
      }
      if (e.key === 'Tab') {
        var overlay = el('quiz-overlay');
        var modal = el('quiz-modal');
        if (!overlay || !overlay.classList.contains('active') || !modal) return;
        var controls = modal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
        if (!controls.length) {
          e.preventDefault();
          modal.focus();
        } else if (e.shiftKey && document.activeElement === controls[0]) {
          e.preventDefault();
          controls[controls.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === controls[controls.length - 1]) {
          e.preventDefault();
          controls[0].focus();
        }
      }
    });
    document.addEventListener('click', function (e) {
      var overlay = el('quiz-overlay');
      if (overlay && e.target === overlay) window.closeQuizModal();
    });
  }

  /* ------------------------------------------------------------------------
     9. TOOL HANDLERS: PRINT, COPY, AUTOSAVE
     ------------------------------------------------------------------------ */

  // Replaces live form fields with their typed values so they survive printing.
  function freezeClone(node) {
    var clone = node.cloneNode(true);
    var liveInputs = node.querySelectorAll('input, select, textarea');
    var cloneInputs = clone.querySelectorAll('input, select, textarea');
    for (var i = 0; i < liveInputs.length; i++) {
      var live = liveInputs[i], c = cloneInputs[i];
      if (!c) continue;
      var val = '';
      if (live.tagName === 'SELECT') {
        val = live.options[live.selectedIndex] ? live.options[live.selectedIndex].text : '';
      } else {
        val = live.value || '';
      }
      var span = document.createElement('span');
      span.textContent = val || '\u2014';
      span.style.cssText = 'display:inline-block;min-width:60px;border-bottom:1px solid #999;padding:2px 4px;font-weight:600;';
      c.parentNode.replaceChild(span, c);
    }
    // remove buttons from the printed version
    var btns = clone.querySelectorAll('button, .btn, .gold-btn, .navy-btn');
    Array.prototype.forEach.call(btns, function (b) { b.parentNode && b.parentNode.removeChild(b); });
    return clone;
  }

  window.printToolReport = function (elementId) {
    var node = el(elementId);
    if (!node) { window.print(); return; }
    var clone = freezeClone(node);
    var w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { window.print(); return; }
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' +
      esc(document.title) + '</title>' +
      '<style>' +
      'body{font-family:Georgia,"Times New Roman",serif;color:#111;margin:32px;line-height:1.5;}' +
      'h1,h2,h3,h4{font-family:Georgia,serif;color:#1b365d;}' +
      'table{width:100%;border-collapse:collapse;margin:16px 0;}' +
      'th,td{border:1px solid #999;padding:8px;text-align:left;vertical-align:top;font-size:12px;}' +
      'th{background:#f1f3f6;}' +
      '.section-label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a6d1f;}' +
      'footer{margin-top:28px;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:10px;}' +
      '</style></head><body>'
    );
    w.document.write(clone.innerHTML);
    w.document.write(
      '<footer>What College Is Really For \u2014 based on interviews with 1,000 college graduates, ages 25 to 65. ' +
      'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021).</footer></body></html>'
    );
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 350);
  };

  window.copyToolToClipboard = function (elementId) {
    var node = el(elementId);
    if (!node) return;
    var clone = freezeClone(node);
    var text = (clone.innerText || clone.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
    function done(ok) {
      var btn = node.querySelector('[onclick*="copyToolToClipboard"]');
      if (btn) {
        var orig = btn.innerHTML;
        btn.innerHTML = ok ? 'Copied' : 'Copy failed';
        setTimeout(function () { btn.innerHTML = orig; }, 1800);
      }
    }
    copyText(text).then(function () { done(true); }, function () { done(false); });
  };

  // Keeps typed answers if someone reloads or comes back later.
  function initToolAutosave() {
    if (!CONFIG.TOOL_AUTOSAVE) return;
    var page = location.pathname.split('/').pop() || 'index.html';
    var tools = document.querySelectorAll('[id$="-tool"]');
    Array.prototype.forEach.call(tools, function (tool) {
      var fields = tool.querySelectorAll('input, select, textarea');
      Array.prototype.forEach.call(fields, function (f, i) {
        var key = CONFIG.STORAGE_PREFIX + page + '_' + tool.id + '_' + i;
        try {
          var saved = localStorage.getItem(key);
          if (saved !== null && saved !== '') f.value = saved;
        } catch (e) { /* storage blocked, ignore */ }
        f.addEventListener('input', function () {
          try { localStorage.setItem(key, f.value); } catch (e) {}
        });
        f.addEventListener('change', function () {
          try { localStorage.setItem(key, f.value); } catch (e) {}
        });
      });
    });
  }

  window.clearToolData = function (toolId) {
    var page = location.pathname.split('/').pop() || 'index.html';
    var tool = el(toolId);
    if (!tool) return;
    var fields = tool.querySelectorAll('input, select, textarea');
    Array.prototype.forEach.call(fields, function (f, i) {
      f.value = '';
      if (f.tagName === 'SELECT') f.selectedIndex = 0;
      try { localStorage.removeItem(CONFIG.STORAGE_PREFIX + page + '_' + toolId + '_' + i); } catch (e) {}
    });
  };

  /* ------------------------------------------------------------------------
     10. BOOTSTRAP
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initAccordions();
    initModalDismiss();
    initToolAutosave();
    initScorecardTabs();

    // Validate every trigger button against the data store, and log mismatches.
    var triggers = document.querySelectorAll('.quiz-trigger-btn');
    Array.prototype.forEach.call(triggers, function (btn) {
      var aud = btn.getAttribute('data-audience');
      if (aud && !QUIZ_DATA[aud]) {
        console.warn('[WCIRF] data-audience "' + aud + '" has no matching quiz in main.js.');
      }
      if (!btn.getAttribute('onclick') && aud) {
        btn.addEventListener('click', function () { window.initQuiz(aud); });
      }
    });

    // Optional, off by default.
    if (CONFIG.AUTO_POPUP && triggers.length) {
      var audience = triggers[0].getAttribute('data-audience');
      if (audience && QUIZ_DATA[audience]) {
        try {
          if (!sessionStorage.getItem('seen_quiz_' + audience)) {
            setTimeout(function () {
              window.initQuiz(audience);
              try { sessionStorage.setItem('seen_quiz_' + audience, '1'); } catch (e) {}
            }, CONFIG.AUTO_POPUP_DELAY_MS);
          }
        } catch (e) { /* storage blocked, skip */ }
      }
    }
  });

  // Exposed for debugging in the console
  window.WCIRF = { data: QUIZ_DATA, panels: PANELS, state: state, config: CONFIG };

})();