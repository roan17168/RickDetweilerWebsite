// ============================================
// 1. QUIZ DATA 
// ============================================
const quizData = {
  "quizzes": [
    {
      "audience": "Looking for College (Prospective Students)",
      "description": "Before you choose a campus, discover the life you are actually trying to build. This quiz maps your values to the specific college experiences that research proves will get you there.",
      "questions": [
        {
          "id": 1,
          "text": "When you imagine your life at age 40, what does 'success' look like to you?",
          "options": [
            {"text": "Leading a team to solve a complex, large-scale problem.", "mapping": "L"},
            {"text": "Being a go-to expert who never stops learning and discovering.", "mapping": "K"},
            {"text": "Making a tangible difference in the lives of people in my community.", "mapping": "C"},
            {"text": "Living a life of creative expression and cultural depth.", "mapping": "A"},
            {"text": "Having a sense of inner peace and a clear personal purpose.", "mapping": "F"},
            {"text": "Achieving high-level professional status and financial security.", "mapping": "S"}
          ]
        },
        {
          "id": 2,
          "text": "Which of these high school experiences made you feel most 'alive'?",
          "options": [
            {"text": "Organizing a group or club to achieve a specific goal.", "mapping": "L"},
            {"text": "Falling down a 'rabbit hole' of research on a topic I love.", "mapping": "K"},
            {"text": "Volunteering for a cause that helped someone in need.", "mapping": "C"},
            {"text": "Performing, writing, or creating something original.", "mapping": "A"},
            {"text": "Having a deep, late-night conversation about the meaning of life.", "mapping": "F"},
            {"text": "Mastering a difficult skill that will help me in my future career.", "mapping": "S"}
          ]
        },
        {
          "id": 3,
          "text": "What kind of relationship do you want to have with your future professors?",
          "options": [
            {"text": "I want a mentor who pushes me to take on leadership roles.", "mapping": "L"},
            {"text": "I want a scholar who challenges my intellectual assumptions.", "mapping": "K"},
            {"text": "I want someone who models how to use knowledge for the common good.", "mapping": "C"},
            {"text": "I want a practitioner who helps me find my creative voice.", "mapping": "A"},
            {"text": "I want a guide who helps me figure out who I am as a person.", "mapping": "F"},
            {"text": "I want an expert who can open doors to my first big job.", "mapping": "S"}
          ]
        },
        {
          "id": 4,
          "text": "If you could only pick one 'superpower' for your career, what would it be?",
          "options": [
            {"text": "The ability to inspire and move people toward a vision.", "mapping": "L"},
            {"text": "The ability to learn anything new, no matter how fast the world changes.", "mapping": "K"},
            {"text": "The ability to build bridges between people with different values.", "mapping": "C"},
            {"text": "The ability to see the world through a unique, artistic lens.", "mapping": "A"},
            {"text": "The ability to stay grounded and happy regardless of external pressure.", "mapping": "F"},
            {"text": "The ability to navigate complex systems to achieve high-level results.", "mapping": "S"}
          ]
        },
        {
          "id": 5,
          "text": "What is your biggest fear about the 'wrong' college choice?",
          "options": [
            {"text": "Being just a number in a crowd where I can't make an impact.", "mapping": "L"},
            {"text": "Getting a narrow education that becomes obsolete in ten years.", "mapping": "K"},
            {"text": "Spending four years in a bubble, disconnected from real-world needs.", "mapping": "C"},
            {"text": "Losing my creative spark in a rigid, pre-professional program.", "mapping": "A"},
            {"text": "Graduating with a degree but no sense of what my life is for.", "mapping": "F"},
            {"text": "Missing out on the network and skills needed for financial independence.", "mapping": "S"}
          ]
        }
      ],
      "results": [
        {
          "profile": "The Leader (L)",
          "description": "You aren't just looking for a job; you're looking for the capacity to move others toward a higher purpose.",
          "research_insight": "Rick Detweiler’s research reveals that leadership is not a byproduct of a specific major, but of a specific 'ecology.' The data shows that students who lived on campus for at least three years and were deeply involved in campus organizations were significantly more likely to hold leadership positions decades later. This is because leadership is a practiced behavior, not just a set of theories learned in a classroom.\n\nFurthermore, the 'context' of your education matters more than the 'content.' The study found that frequent, non-academic interactions with faculty—talking about life, values, and goals outside of class—is one of the strongest predictors of adult leadership. You need an environment where you are known by name and pushed to take responsibility for a community.",
          "quotes": [
            "The liberal arts attribute that is most consistently related to all three aspects of adult life is an education in an authentic and personally involving educational community.",
            "Leadership... [is] an exemplar of a long-held purpose of education in the tradition of the liberal arts."
          ]
        },
        {
          "profile": "The Career Builder (S)",
          "description": "You want a return on your investment. The research shows that the best ROI comes from a surprising place: breadth.",
          "research_insight": "While many students choose a college based on the prestige of a specific major, Detweiler’s longitudinal study found that the major itself is essentially unrelated to long-term income or professional success. Instead, the data shows a 'breadth effect.' Students who took more than half of their courses outside of their major earned significantly higher incomes as adults—up to 34% more for those from lower-income backgrounds.\n\nThis counterintuitive finding suggests that in a rapidly changing economy, the ability to think across disciplines is more valuable than narrow specialization. The research indicates that the 'early job advantage' of vocational majors fades quickly, while the 'liberal arts advantage'—the ability to communicate, adapt, and solve complex problems—compounds over a 40-year career.",
          "quotes": [
            "Taking more than half of one’s courses outside one’s major turns out to be especially thought-provoking when it comes to its relationship to long-term success.",
            "While first job placement and income may be better for those with specialized training, this advantage disappears rather quickly."
          ]
        }
      ]
    },
    {
      "audience": "Current Students",
      "description": "Are you just 'doing' college, or are you building a life? Check your current habits against the research to see if you're maximizing the impact of your education.",
      "questions": [
        {
          "id": 1,
          "text": "How often do you talk to your professors about things *not* related to your assignments?",
          "options": [
            {"text": "Regularly—we talk about life, career goals, and big ideas.", "mapping": "Impact"},
            {"text": "Occasionally—usually just a quick chat after class.", "mapping": "Moderate"},
            {"text": "Rarely—I only talk to them if I have a question about a grade.", "mapping": "Low"}
          ]
        },
        {
          "id": 2,
          "text": "What percentage of your classes are outside of your major requirements?",
          "options": [
            {"text": "More than half—I love exploring different fields.", "mapping": "Impact"},
            {"text": "About a third—I take my gen-eds, but focus on my major.", "mapping": "Moderate"},
            {"text": "As few as possible—I want to be an expert in my field.", "mapping": "Low"}
          ]
        },
        {
          "id": 3,
          "text": "In your classes, how often are you asked to defend your views or solve problems with no 'right' answer?",
          "options": [
            {"text": "In almost every class—it's challenging but rewarding.", "mapping": "Impact"},
            {"text": "In some classes, but others are mostly lectures and exams.", "mapping": "Moderate"},
            {"text": "Hardly ever—most of my work is about memorizing the right info.", "mapping": "Low"}
          ]
        },
        {
          "id": 4,
          "text": "How involved are you in the 'life' of the campus (clubs, activism, residential events)?",
          "options": [
            {"text": "Very involved—I hold a leadership role or participate daily.", "mapping": "Impact"},
            {"text": "Somewhat involved—I go to events when I have time.", "mapping": "Moderate"},
            {"text": "Not at all—I mostly just go to class and go home.", "mapping": "Low"}
          ]
        },
        {
          "id": 5,
          "text": "How often do you have serious conversations with students whose political or religious beliefs are the opposite of yours?",
          "options": [
            {"text": "Frequently—it's one of the best parts of being here.", "mapping": "Impact"},
            {"text": "Sometimes, but it usually stays pretty surface-level.", "mapping": "Moderate"},
            {"text": "Rarely—I mostly hang out with people who think like I do.", "mapping": "Low"}
          ]
        }
      ],
      "results": [
        {
          "profile": "The High-Impact Student",
          "description": "You are currently living in the 'Sweet Spot' of the liberal arts ecology.",
          "research_insight": "Detweiler’s research highlights that the most successful and fulfilled adults were those who leaned into the 'context' of their education. By engaging in out-of-class conversations with faculty and peers, you are developing what the book calls 'larger perspectives.' The data shows that students who frequently discussed philosophical or ethical perspectives in most classes were 59% more likely to live a life of inquiry as adults.\n\nYour habit of taking courses outside your major is also a high-impact behavior. The research found that 'span of study'—the deliberate choice to learn across the humanities, social sciences, and sciences—is a primary driver of long-term career success and personal fulfillment. You aren't just earning a degree; you are building the intellectual and social infrastructure for a life of consequence.",
          "quotes": [
            "Approaches to teaching that directly engage students and their emotions in the learning process are essential.",
            "Impactful learning occurs... through extensive relationships with faculty and staff, meaningful engagement with other students who contribute different values and life experiences."
          ]
        }
      ]
    },
    {
      "audience": "Professors",
      "description": "Your impact on students lasts for decades—but it might not be coming from where you think. See how your teaching and mentoring align with the evidence of long-term life impact.",
      "questions": [
        {
          "id": 1,
          "text": "How many of your current students do you know by their first name?",
          "options": [
            {"text": "All or nearly all of them.", "mapping": "Mentor"},
            {"text": "Most of them, especially the ones who speak up.", "mapping": "Teacher"},
            {"text": "Only a few—my classes are too large for that.", "mapping": "Lecturer"}
          ]
        },
        {
          "id": 2,
          "text": "How often do you discuss non-academic matters (life, values, ethics) with students outside of class?",
          "options": [
            {"text": "Frequently—it's a core part of my role.", "mapping": "Mentor"},
            {"text": "Occasionally, if a student brings it up.", "mapping": "Teacher"},
            {"text": "Rarely—I prefer to keep my interactions professional and focused on the subject.", "mapping": "Lecturer"}
          ]
        },
        {
          "id": 3,
          "text": "In your pedagogy, how much time is dedicated to student-led discussion versus your own lecturing?",
          "options": [
            {"text": "Discussion is the center of the class; I am a facilitator.", "mapping": "Mentor"},
            {"text": "It's a mix—I lecture for half and we discuss for half.", "mapping": "Teacher"},
            {"text": "I primarily lecture to ensure all content is covered.", "mapping": "Lecturer"}
          ]
        },
        {
          "id": 4,
          "text": "How often do you challenge students to examine the strengths and weaknesses of their own deeply held views?",
          "options": [
            {"text": "In almost every class session.", "mapping": "Mentor"},
            {"text": "Occasionally, when the topic naturally allows for it.", "mapping": "Teacher"},
            {"text": "Rarely—I focus on the objective facts of the discipline.", "mapping": "Lecturer"}
          ]
        },
        {
          "id": 5,
          "text": "Do you see yourself primarily as a researcher who teaches, or a mentor who does research?",
          "options": [
            {"text": "A mentor first—my impact on students is my primary legacy.", "mapping": "Mentor"},
            {"text": "A balance of both.", "mapping": "Teacher"},
            {"text": "A researcher first—my contribution to the field is my priority.", "mapping": "Lecturer"}
          ]
        }
      ],
      "results": [
        {
          "profile": "The Impact Mentor",
          "description": "You are the 'Secret Sauce' of the liberal arts experience.",
          "research_insight": "Rick Detweiler’s research provides a powerful validation of the mentoring role. The data shows that students who had a professor who 'cared about them as a person' and who 'encouraged them to pursue their goals and dreams' were twice as likely to be engaged in their work and thriving in their well-being decades later. This 'personal bond' is what the ancient Greeks called the essence of advanced education.\n\nYour focus on discussion-based pedagogy and challenging students' assumptions is also backed by hard data. The study found that students whose professors encouraged them to examine their own views were 149% more likely to report a life of fulfillment as adults. By prioritizing the 'context' of the relationship over the mere delivery of 'content,' you are ensuring that your teaching has a longitudinal impact that far outlasts the final exam.",
          "quotes": [
            "Professors encouraged students to examine strengths/weaknesses of their views... [leading to] 149% [increase in fulfillment].",
            "If having an impact on the future lives of graduates is what motivates a professor... then a liberal arts–based college is the place to work."
          ]
        }
      ]
    },
    {
      "audience": "Parents",
      "description": "You want your child to be successful, happy, and independent. Discover what the research says about which college experiences actually lead to those outcomes.",
      "questions": [
        {
          "id": 1,
          "text": "What is your primary goal for your child's college education?",
          "options": [
            {"text": "That they get a high-paying job immediately after graduation.", "mapping": "Success"},
            {"text": "That they become a well-rounded person who knows how to think.", "mapping": "Fulfillment"},
            {"text": "That they find a career that allows them to help others.", "mapping": "Consequence"}
          ]
        },
        {
          "id": 2,
          "text": "How do you feel about your child choosing a 'non-vocational' major like Philosophy or History?",
          "options": [
            {"text": "I'm worried—I want them to have a clear career path.", "mapping": "Success"},
            {"text": "I'm supportive, as long as they learn marketable skills too.", "mapping": "Fulfillment"},
            {"text": "I'm all for it—I want them to follow their passions.", "mapping": "Consequence"}
          ]
        },
        {
          "id": 3,
          "text": "Which do you think is more important for your child's future success?",
          "options": [
            {"text": "The specific technical skills they learn in their major.", "mapping": "Success"},
            {"text": "The relationships they build with mentors and peers.", "mapping": "Consequence"},
            {"text": "Their ability to adapt and learn new things on their own.", "mapping": "Fulfillment"}
          ]
        },
        {
          "id": 4,
          "text": "When you look at a college, what 'metric' matters most to you?",
          "options": [
            {"text": "The average starting salary of graduates.", "mapping": "Success"},
            {"text": "The student-to-faculty ratio and class sizes.", "mapping": "Consequence"},
            {"text": "The percentage of students who go on to advanced degrees.", "mapping": "Fulfillment"}
          ]
        }
      ],
      "results": [
        {
          "profile": "The Evidence-Based Parent",
          "description": "You are looking for a 'Life of Accomplishment' for your child.",
          "research_insight": "It is natural to worry about the 'first job,' but Detweiler’s research shows that the most successful adults—those with the highest incomes and most prestigious positions—were not necessarily those with vocational majors. In fact, for students from lower-income families, taking a broad range of courses outside their major was the single most powerful predictor of high adult income. Breadth is not a luxury; it is a career strategy.\n\nFurthermore, the research shows that 'fulfillment'—the sense of living a meaningful life—is most highly correlated with studying the humanities and engaging in philosophical discussions. If you want your child to be both successful and happy, the evidence suggests you should look for a college that prioritizes 'mentorship' and 'intellectual challenge' over narrow job training. The relationship is the real return on investment.",
          "quotes": [
            "The decision you're making now will shape your life long after your first job is a memory.",
            "For life success (income and position), the liberal arts had neither a positive nor a negative effect... [but] over the long term, the significant effects of both gender and race/ethnicity disappear [for liberal arts graduates]."
          ]
        }
      ]
    },
    {
      "audience": "Administrators",
      "description": "In an era of budget cuts and 'vocational' pressure, how do you protect your institution's mission? See how your priorities align with the data on student flourishing.",
      "questions": [
        {
          "id": 1,
          "text": "When you talk to donors or the board, what is your primary 'value proposition'?",
          "options": [
            {"text": "Our high job-placement rates and starting salaries.", "mapping": "Market"},
            {"text": "Our commitment to the 'common good' and civic leadership.", "mapping": "Mission"},
            {"text": "Our unique, personalized learning community.", "mapping": "Ecology"}
          ]
        },
        {
          "id": 2,
          "text": "If you had to cut 10% of the budget, where would you look first?",
          "options": [
            {"text": "Student life and non-academic programming.", "mapping": "Market"},
            {"text": "Small, 'low-enrollment' humanities departments.", "mapping": "Market"},
            {"text": "Administrative overhead and non-essential facilities.", "mapping": "Mission"}
          ]
        },
        {
          "id": 3,
          "text": "How do you incentivize your faculty?",
          "options": [
            {"text": "Primarily through research output and grant funding.", "mapping": "Market"},
            {"text": "Through a balance of research and teaching excellence.", "mapping": "Ecology"},
            {"text": "By rewarding mentorship and out-of-class student engagement.", "mapping": "Mission"}
          ]
        },
        {
          "id": 4,
          "text": "What is the 'ideal' size for your institution?",
          "options": [
            {"text": "Large enough to have massive resources and brand name.", "mapping": "Market"},
            {"text": "Small enough that every student can have a mentor.", "mapping": "Mission"},
            {"text": "A mid-sized 'research-lite' model.", "mapping": "Ecology"}
          ]
        }
      ],
      "results": [
        {
          "profile": "The Mission Guardian",
          "description": "You understand that 'Institutional Purpose' is your greatest asset.",
          "research_insight": "Rick Detweiler’s analysis of 241 liberal arts college mission statements found that 95% of them focus on 'Altruism,' 'Continued Learning,' and 'Leadership.' However, the research shows that these outcomes are only achieved when resources are allocated to the 'educational ecology'—specifically, the context of the learning environment. Administrators who prioritize faculty-student interaction and authentic community are the ones who actually deliver on their mission.\n\nThe data is clear: many impactful practices are 'budget neutral.' They require a shift in priority and time, not necessarily more money. For example, encouraging faculty to spend more time with students outside of class or limiting major requirements to allow for more breadth are high-impact, low-cost strategies. Your role is to protect the 'human scale' of the institution against the pressure to become a 'degree factory.'",
          "quotes": [
            "Many impactful practices of liberal arts education are budget neutral: they focus on having faculty and staff spend more time with students outside of class.",
            "The sudden and extreme changes in higher education... have given us the opportunity to rethink what really matters for higher learning."
          ]
        }
      ]
    },
    {
      "audience": "Legislators",
      "description": "Is higher education a private benefit or a public good? Use the data to see how liberal arts principles contribute to a healthy democracy and a resilient workforce.",
      "questions": [
        {
          "id": 1,
          "text": "What is the most important 'ROI' for state-funded higher education?",
          "options": [
            {"text": "Filling immediate gaps in the local workforce.", "mapping": "Economic"},
            {"text": "Developing a responsible, civically engaged citizenry.", "mapping": "Civic"},
            {"text": "Ensuring long-term economic resilience and innovation.", "mapping": "Resilience"}
          ]
        },
        {
          "id": 2,
          "text": "How should we measure the 'quality' of a college?",
          "options": [
            {"text": "By the first-year earnings of its graduates.", "mapping": "Economic"},
            {"text": "By the percentage of graduates who volunteer and lead in their communities.", "mapping": "Civic"},
            {"text": "By the long-term career adaptability of its alumni.", "mapping": "Resilience"}
          ]
        },
        {
          "id": 3,
          "text": "In a world of AI and automation, what skills should we be funding?",
          "options": [
            {"text": "Technical skills like coding and data entry.", "mapping": "Economic"},
            {"text": "Human skills like critical thinking, ethics, and collaboration.", "mapping": "Resilience"},
            {"text": "Civic skills like debate and community organizing.", "mapping": "Civic"}
          ]
        },
        {
          "id": 4,
          "text": "What is the biggest threat to our state's future?",
          "options": [
            {"text": "A lack of specialized workers for current industries.", "mapping": "Economic"},
            {"text": "A breakdown in civic discourse and democratic participation.", "mapping": "Civic"},
            {"text": "An inability to adapt to rapid technological change.", "mapping": "Resilience"}
          ]
        }
      ],
      "results": [
        {
          "profile": "The Civic ROI Advocate",
          "description": "You recognize that the 'Common Good' is the ultimate measure of educational success.",
          "research_insight": "Rick Detweiler’s research provides the 'hard data' for what has long been a 'soft' argument: liberal arts education produces the citizens a democracy needs. The study found that graduates who experienced an 'authentic learning community' were 56% more likely to contribute a larger percentage of their income to charity and significantly more likely to volunteer. This is the 'Civic ROI' that specialized, vocational training often fails to produce.\n\nFurthermore, the research challenges the 'Prussian' model of education—designed to create efficient bureaucrats for the state. Detweiler shows that in a time of constant change, the most 'practical' education is one that is broad and non-vocational. Legislators who focus solely on 'first-job income' are using a flawed metric that ignores the long-term economic and social resilience that liberal arts graduates provide to the state.",
          "quotes": [
            "What is now frequently used as a key indicator of the quality of a college or university—first job income—must be supplemented or replaced by indicators of longer-term life outcomes.",
            "The 'everyone' priority and historic liberal arts 'higher good' purpose conflicted with the Prussian-European purpose, which was designed to serve the immediate needs of the monarch and the state."
          ]
        }
      ]
    }
  ]
};

// ============================================
// 2. GLOBAL STATE
// ============================================
let currentQuiz = null;
let currentStep = 0;
let userAnswers = [];

// ============================================
// 3. GLOBAL FUNCTIONS (Accessible to HTML)
// ============================================

// We attach these to 'window' so the HTML onclicks can find them
window.initQuiz = function(audienceName) {
    currentQuiz = quizData.quizzes.find(q => q.audience === audienceName);
    currentStep = 0;
    userAnswers = [];

    if (!currentQuiz) return console.error("Quiz not found for:", audienceName);

    document.getElementById('quiz-overlay').classList.add('active');
    
    // Show a Welcome Screen first instead of jumping straight to Question 1
    const container = document.getElementById('quiz-content');
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
            <h2 class="result-profile" style="font-size: 2rem;">How will the Liberal Arts affect you?</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; line-height: 1.6;">
                Based on Rick Detweiler's research, this quick quiz will show you how your values 
                align with the lifelong impacts of a liberal arts education.
            </p>
            <button class="quiz-trigger-btn" onclick="window.renderStep()">Begin the Quiz</button>
        </div>
    `;
};

window.renderStep = function() {
    const container = document.getElementById('quiz-content');
    const progress = document.getElementById('quiz-progress-bar');
    const question = currentQuiz.questions[currentStep];
    
    const progressPercent = (currentStep / currentQuiz.questions.length) * 100;
    progress.style.width = `${progressPercent}%`;

    container.innerHTML = `
        <div class="quiz-question-text">${question.text}</div>
        <div class="quiz-options-list">
            ${question.options.map((opt, index) => `
                <div class="quiz-option" onclick="window.selectOption('${opt.mapping}', ${index})">
                    ${opt.text}
                </div>
            `).join('')}
        </div>
        <div class="quiz-nav">
            <button class="quiz-btn" onclick="window.prevStep()" ${currentStep === 0 ? 'disabled' : ''}>Back</button>
            <button id="next-btn" class="quiz-btn quiz-btn-next" onclick="window.nextStep()" disabled>Next</button>
        </div>
    `;
};

window.selectOption = function(mapping, index) {
    userAnswers[currentStep] = mapping;
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    options[index].classList.add('selected');
    document.getElementById('next-btn').disabled = false;
};

window.nextStep = function() {
    if (currentStep < currentQuiz.questions.length - 1) {
        currentStep++;
        window.renderStep();
    } else {
        window.showResults();
    }
};

window.prevStep = function() {
    if (currentStep > 0) {
        currentStep--;
        window.renderStep();
    }
};

window.showResults = function() {
    document.getElementById('quiz-progress-bar').style.width = '100%';

    // Calculate result based on most frequent mapping
    const counts = {};
    userAnswers.forEach(m => counts[m] = (counts[m] || 0) + 1);
    const winningMapping = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    // Find result that matches the mapping (e.g., "L", "S", "Impact")
    const result = currentQuiz.results.find(r => 
        r.profile.includes(`(${winningMapping})`) || r.profile.includes(winningMapping)
    ) || currentQuiz.results[0];

    document.getElementById('quiz-content').innerHTML = `
        <div class="result-profile">${result.profile}</div>
        <div class="result-description">${result.description}</div>
        <div class="result-insight">
            ${result.research_insight.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
        ${result.quotes.map(q => `<blockquote class="result-quote">"${q}"<br><cite>— Rick Detweiler</cite></blockquote>`).join('')}
        <div class="quiz-nav">
            <button class="quiz-btn" onclick="window.initQuiz('${currentQuiz.audience}')">Retake Quiz</button>
            <button class="quiz-btn quiz-btn-next" onclick="window.closeQuiz()">Close</button>
        </div>
    `;
};

window.closeQuiz = function() {
    document.getElementById('quiz-overlay').classList.remove('active');
};

// ============================================
// 4. UI INITIALIZATION (Keep inside Listener)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ main.js UI Loaded');

    // Hamburger Menu Logic
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Accordion Logic
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            const panel = document.getElementById(button.getAttribute('aria-controls'));
            if (panel) panel.setAttribute('data-open', !isExpanded);
        });
    });

    // Close quiz on overlay click
    const overlay = document.getElementById('quiz-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'quiz-overlay') window.closeQuiz();
        });
    }
     // ============================================
    // AUTO-POPUP LOGIC
    // ============================================
    const autoTriggerBtn = document.querySelector('.quiz-trigger-btn');
    
    if (autoTriggerBtn) {
        const audience = autoTriggerBtn.getAttribute('data-audience');
        console.log("🎯 Auto-popup found audience:", audience);
        
        if (audience) {
            const hasSeenPopup = sessionStorage.getItem(`seen_quiz_${audience}`);
            
            if (!hasSeenPopup) {
                setTimeout(() => {
                    console.log("🚀 Auto-launching quiz for:", audience);
                    sessionStorage.setItem(`seen_quiz_${audience}`, 'true');
                    initQuiz(audience);
                }, 1000);
            } else {
                console.log("👋 User has already seen this quiz today, skipping auto-popup");
            }
        } else {
            console.warn("⚠️ Quiz button found but missing data-audience attribute!");
        }
    } else {
        console.warn("⚠️ No .quiz-trigger-btn found on this page");
    }
});
