'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = ROOT; // GitHub Pages serves the repository root

function read(relative) {
  return fs.readFileSync(path.join(SRC, relative), 'utf8');
}

function render(template, data) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, function (match, key) {
    return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match;
  });
}

const chart = require('./src/scripts/chart.js');
const chartHtml = chart.build(JSON.parse(read('data/big-picture.json')));

const head = read('partials/head.html');
const header = read('partials/header.html');
const footer = read('partials/footer.html');
const notesPartial = read('partials/notes.html');
const numbersNote = read('partials/numbers.html');

const site = JSON.parse(read('data/site.json'));
if (!site.url) site.url = '';
const siteUrl = String(process.env.SITE_URL || site.url || '').replace(/\/+$/, '');

function pageRoute(file) {
  return file === 'index.html' ? '' : file;
}

function absoluteUrl(route) {
  if (!siteUrl) return '';
  var clean = String(route || '').replace(/^\/+/, '');
  return clean ? siteUrl + '/' + clean : siteUrl + '/';
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sharingImage(page) {
  var image = page.sharingImage || site.sharingImage;
  return image ? absoluteUrl(image) : '';
}

function seoTags(page) {
  var canonical = absoluteUrl(pageRoute(page.file));
  var image = sharingImage(page);
  var tags = [];
  if (canonical) {
    tags.push('<link rel="canonical" href="' + escapeAttr(canonical) + '">');
    tags.push('<meta property="og:url" content="' + escapeAttr(canonical) + '">');
  }
  if (image) {
    tags.push('<meta property="og:image" content="' + escapeAttr(image) + '">');
    tags.push('<meta property="og:image:alt" content="' + escapeAttr(page.sharingImageAlt || site.sharingImageAlt) + '">');
    tags.push('<meta property="og:image:type" content="image/jpeg">');
  }
  return tags.join('\n  ');
}

function twitterImageTag(page) {
  var image = sharingImage(page);
  if (!image) return '';
  return (
    '<meta name="twitter:image" content="' + escapeAttr(image) + '">\n  ' +
    '<meta name="twitter:image:alt" content="' + escapeAttr(page.sharingImageAlt || site.sharingImageAlt) + '">'
  );
}

function structuredData(page) {
  if (!siteUrl || page.robots) return '';
  var canonical = absoluteUrl(pageRoute(page.file));
  var orgId = siteUrl + '/#organization';
  var websiteId = siteUrl + '/#website';
  var graph = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: site.publisher,
      url: site.publisherUrl,
      logo: { '@type': 'ImageObject', url: absoluteUrl('assets/favicon-512.png') },
      email: site.contactEmail
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl + '/',
      name: site.name,
      publisher: { '@id': orgId },
      inLanguage: 'en-US'
    },
    {
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': websiteId },
      inLanguage: 'en-US'
    }
  ];
  if (page.file === 'index.html' || page.file === 'about.html') {
    graph.push({
      '@type': 'Book',
      '@id': siteUrl + '/#book',
      name: 'The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment',
      author: { '@type': 'Person', name: 'Richard A. Detweiler' },
      publisher: { '@type': 'Organization', name: 'MIT Press' },
      isbn: '9780262543101',
      datePublished: '2021',
      url: 'https://mitpress.mit.edu/9780262543101/the-evidence-liberal-arts-needs'
    });
  }
  return '<script type="application/ld+json">\n' + JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2) + '\n  </script>';
}

const siteNotes = {
  home: [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    }
  ],
  'what-matters': [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 2,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 3,
      text: 'Gregory M. Walton and Geoffrey L. Cohen, &ldquo;A Brief Social-Belonging Intervention Improves Academic and Health Outcomes of Minority Students,&rdquo; <em>Science</em> 331 (2011): 1447&ndash;1451.'
    },
    {
      n: 4,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    }
  ],
  about: [
    {
      n: 1,
      text: 'Michael T. Nietzel, \u201cThe Best Higher Education Books of 2021,\u201d <em>Forbes</em>, December 1, 2021.'
    },
    {
      n: 2,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021).'
    }
  ],
  privacy: [],
      research: [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 2,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, ch. 5 and appendixes 2, 3 and 4.'
    },
    {
      n: 3,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, chapters 6 to 8 and appendix 5, figures A5.1 to A5.6.'
    },
    {
      n: 4,
      text: 'Alexander W. Astin, <em>What Matters in College? Four Critical Years Revisited</em> (Jossey-Bass, 1993).'
    },
    {
      n: 5,
      text: 'Ernest T. Pascarella and Patrick T. Terenzini, <em>How College Affects Students</em>, vol. 2 (Jossey-Bass, 2005).'
    },
    {
      n: 6,
      text: 'Richard J. Light, <em>Making the Most of College: Students Speak Their Minds</em> (Harvard University Press, 2001).'
    },
    {
      n: 7,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 8,
      text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
    },
    {
      n: 9,
      text: 'Scott Freeman and others, &ldquo;Active Learning Increases Student Performance in Science, Engineering, and Mathematics,&rdquo; <em>PNAS</em> 111, no. 23 (2014): 8410&ndash;8415.'
    },
    {
      n: 10,
      text: 'George D. Kuh, <em>High-Impact Educational Practices: What They Are, Who Has Access to Them, and Why They Matter</em> (AAC&amp;U, 2008).'
    },
    {
      n: 11,
      text: 'Gregory M. Walton and Geoffrey L. Cohen, &ldquo;A Brief Social-Belonging Intervention Improves Academic and Health Outcomes of Minority Students,&rdquo; <em>Science</em> 331 (2011): 1447&ndash;1451.'
    },
    {
      n: 12,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 13,
      text: 'Bureau of Labor Statistics, &ldquo;From age 18 to 38, Americans born 1957&ndash;64 held more jobs than those born 1980&ndash;84,&rdquo; <em>The Economics Daily</em>, May 12, 2026.'
    },
    {
      n: 14,
      text: 'World Economic Forum, <em>The Future of Jobs Report 2025</em> (2025).'
    }
  ],
    choosing: [
      {
        n: 1,
        text: 'Stacy Dale and Alan B. Krueger, &ldquo;Estimating the Effects of College Characteristics over the Career Using Administrative Earnings Data,&rdquo; <em>Journal of Human Resources</em> 49, no. 2 (2014): 323&ndash;358.'
      },
      {
        n: 2,
        text: 'Raj Chetty, David J. Deming and John N. Friedman, &ldquo;Diversifying Society&rsquo;s Leaders? The Causal Effects of Admission to Highly Selective Private Colleges,&rdquo; NBER Working Paper No. 31492 (July 2023).'
      },
      {
        n: 3,
        text: 'National Association of College and University Business Officers, <em>2025 Tuition Discounting Study</em> (2026), as reported by Higher Ed Dive.'
      },
      {
        n: 4,
        text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
      },
      {
        n: 5,
        text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021), pp. 162&ndash;166 and figures A5.6a to A5.6d; liberal arts colleges and the six experiences, pp. 191&ndash;192.'
      },
      {
        n: 6,
        text: 'Gregory M. Walton and Geoffrey L. Cohen, &ldquo;A Brief Social-Belonging Intervention Improves Academic and Health Outcomes of Minority Students,&rdquo; <em>Science</em> 331 (2011): 1447&ndash;1451.'
      },
      {
        n: 7,
        text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
      },
      {
        n: 8,
        text: 'Alexander W. Astin, <em>What Matters in College? Four Critical Years Revisited</em> (Jossey-Bass, 1993).'
      },
      {
        n: 9,
        text: 'George D. Kuh, <em>High-Impact Educational Practices: What They Are, Who Has Access to Them, and Why They Matter</em> (AAC&amp;U, 2008).'
      },
      {
        n: 10,
        text: 'Ernest T. Pascarella and Patrick T. Terenzini, <em>How College Affects Students</em>, vol. 2 (Jossey-Bass, 2005).'
      },
      {
        n: 11,
        text: 'Richard J. Light, <em>Making the Most of College: Students Speak Their Minds</em> (Harvard University Press, 2001).'
      },
      {
        n: 12,
        text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
      },
      {
        n: 13,
        text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
      }
    ],
  'in-college': [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021), chapters 6 to 8 and appendix 5; success and income, pp. 162&ndash;166 and figures A5.6a to A5.6d.'
    },
    {
      n: 2,
      text: 'Graduate Management Admission Council, <em>Corporate Recruiters Survey</em> (2026).'
    },
    {
      n: 3,
      text: 'Gregory M. Walton and Geoffrey L. Cohen, &ldquo;A Brief Social-Belonging Intervention Improves Academic and Health Outcomes of Minority Students,&rdquo; <em>Science</em> 331 (2011): 1447&ndash;1451.'
    },
    {
      n: 4,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 5,
      text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
    },
    {
      n: 6,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 7,
      text: 'Scott Freeman and others, &ldquo;Active Learning Increases Student Performance in Science, Engineering, and Mathematics,&rdquo; <em>PNAS</em> 111, no. 23 (2014): 8410&ndash;8415.'
    }
  ],
  parents: [
    {
      n: 1,
      text: 'Pew Research Center, &ldquo;Parenting in America Today&rdquo; (January 2023).'
    },
    {
      n: 2,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 3,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021), pp. 162&ndash;166 and figures A5.6a to A5.6d; liberal arts colleges, pp. 191&ndash;192.'
    },
    {
      n: 4,
      text: 'National Association of College and University Business Officers, <em>2025 Tuition Discounting Study</em> (2026), as reported by Higher Ed Dive.'
    },
    {
      n: 5,
      text: 'Graduate Management Admission Council, <em>Corporate Recruiters Survey</em> (2026).'
    },
    {
      n: 6,
      text: 'Ernest T. Pascarella and Patrick T. Terenzini, <em>How College Affects Students</em>, vol. 2 (Jossey-Bass, 2005).'
    },
    {
      n: 7,
      text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
    },
    {
      n: 8,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 9,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 10,
      text: 'World Economic Forum, <em>The Future of Jobs Report 2025</em> (2025).'
    }
  ],
  faculty: [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 2,
      text: 'George D. Kuh, <em>High-Impact Educational Practices: What They Are, Who Has Access to Them, and Why They Matter</em> (AAC&amp;U, 2008).'
    },
    {
      n: 3,
      text: 'Alexander W. Astin, <em>What Matters in College? Four Critical Years Revisited</em> (Jossey-Bass, 1993).'
    },
    {
      n: 4,
      text: 'Scott Freeman and others, &ldquo;Active Learning Increases Student Performance in Science, Engineering, and Mathematics,&rdquo; <em>PNAS</em> 111, no. 23 (2014): 8410&ndash;8415.'
    },
    {
      n: 5,
      text: 'Richard J. Light, <em>Making the Most of College: Students Speak Their Minds</em> (Harvard University Press, 2001).'
    },
    {
      n: 6,
      text: 'Gregory M. Walton and Geoffrey L. Cohen, &ldquo;A Brief Social-Belonging Intervention Improves Academic and Health Outcomes of Minority Students,&rdquo; <em>Science</em> 331 (2011): 1447&ndash;1451.'
    },
    {
      n: 7,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 8,
      text: 'Cassandra M. Guarino and Victor M. H. Borden, &ldquo;Faculty Service Loads and Gender: Are Women Taking Care of the Academic Family?&rdquo; <em>Research in Higher Education</em> 58 (2017): 672&ndash;694.'
    }
  ],
  counselors: [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 2,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021), pp. 162&ndash;166 and figures A5.6a to A5.6d; liberal arts colleges, pp. 191&ndash;192.'
    },
    {
      n: 3,
      text: 'Stacy Dale and Alan B. Krueger, &ldquo;Estimating the Effects of College Characteristics over the Career Using Administrative Earnings Data,&rdquo; <em>Journal of Human Resources</em> 49, no. 2 (2014): 323&ndash;358.'
    },
    {
      n: 4,
      text: 'Raj Chetty, David J. Deming and John N. Friedman, &ldquo;Diversifying Society&rsquo;s Leaders? The Causal Effects of Admission to Highly Selective Private Colleges,&rdquo; NBER Working Paper No. 31492 (July 2023).'
    },
    {
      n: 5,
      text: 'George D. Kuh, <em>High-Impact Educational Practices: What They Are, Who Has Access to Them, and Why They Matter</em> (AAC&amp;U, 2008).'
    },
    {
      n: 6,
      text: 'William Damon, <em>The Path to Purpose: How Young People Find Their Calling in Life</em> (Free Press, 2008).'
    },
    {
      n: 7,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 8,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 9,
      text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
    },
    {
      n: 10,
      text: 'American School Counselor Association, student-to-school-counselor ratio, 2024&ndash;25 (372 to 1; recommended 250 to 1).'
    }
  ],
  'college-leaders': [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 2,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 3,
      text: 'George D. Kuh, <em>High-Impact Educational Practices: What They Are, Who Has Access to Them, and Why They Matter</em> (AAC&amp;U, 2008).'
    },
    {
      n: 4,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 5,
      text: 'Alexander W. Astin, <em>What Matters in College? Four Critical Years Revisited</em> (Jossey-Bass, 1993).'
    },
    {
      n: 6,
      text: 'Ernest T. Pascarella and Patrick T. Terenzini, <em>How College Affects Students</em>, vol. 2 (Jossey-Bass, 2005).'
    },
    {
      n: 7,
      text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
    },
    {
      n: 8,
      text: 'George D. Kuh, Jillian Kinzie, John H. Schuh, Elizabeth J. Whitt and others, <em>Student Success in College: Creating Conditions That Matter</em> (Jossey-Bass, 2005).'
    },
    {
      n: 9,
      text: 'Bureau of Labor Statistics, &ldquo;From age 18 to 38, Americans born 1957&ndash;64 held more jobs than those born 1980&ndash;84,&rdquo; <em>The Economics Daily</em>, May 12, 2026.'
    },
    {
      n: 10,
      text: 'Gallup and Strada Education Network, national alumni survey (2019), as cited in Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021), p. 191.'
    }
  ],
  policymakers: [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 2,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021), pp. 162&ndash;166 and figures A5.6a and A5.6d.'
    },
    {
      n: 3,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, figures A5.6c and A5.6d.'
    },
    {
      n: 4,
      text: 'George D. Kuh, <em>High-Impact Educational Practices: What They Are, Who Has Access to Them, and Why They Matter</em> (AAC&amp;U, 2008).'
    },
    {
      n: 5,
      text: 'U.S. Department of Education, &ldquo;Fact Sheet: Trump Administration Implements Accountability Provisions of Working Families Tax Cuts Act,&rdquo; June 29, 2026.'
    },
    {
      n: 6,
      text: 'Graduate Management Admission Council, <em>Corporate Recruiters Survey</em> (2026).'
    },
    {
      n: 7,
      text: 'Bureau of Labor Statistics, &ldquo;From age 18 to 38, Americans born 1957&ndash;64 held more jobs than those born 1980&ndash;84,&rdquo; <em>The Economics Daily</em>, May 12, 2026.'
    },
    {
      n: 8,
      text: 'World Economic Forum, <em>The Future of Jobs Report 2025</em> (2025).'
    },
    {
      n: 9,
      text: 'Stacy Dale and Alan B. Krueger, &ldquo;Estimating the Effects of College Characteristics over the Career Using Administrative Earnings Data,&rdquo; <em>Journal of Human Resources</em> 49, no. 2 (2014): 323&ndash;358.'
    },
    {
      n: 10,
      text: 'Raj Chetty, David J. Deming and John N. Friedman, &ldquo;Diversifying Society&rsquo;s Leaders? The Causal Effects of Admission to Highly Selective Private Colleges,&rdquo; NBER Working Paper No. 31492 (July 2023).'
    }
  ],
  'course-self-audit': [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    }
  ],
  'policy-brief': [
    {
      n: 1,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    }
  ],
  'leaders-checklist': [],
  'semester-plan': [],
  understanding: [
    {
      n: 1,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs</em> (MIT Press, 2021), pp. 191&ndash;192.'
    },
    {
      n: 2,
      text: 'Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021); findings in chapters 6 to 8 and appendix 5.'
    },
    {
      n: 3,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, ch. 3.'
    },
    {
      n: 4,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, ch. 3.'
    },
    {
      n: 5,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, ch. 2.'
    },
    {
      n: 6,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, p. 162.'
    },
    {
      n: 7,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, ch. 6.'
    },
    {
      n: 8,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, p. 164.'
    },
    {
      n: 9,
      text: 'Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em>, p. 162.'
    },
    {
      n: 10,
      text: 'Detweiler, &ldquo;The Floor and the Ceiling,&rdquo; <em>HigherEdImpact Review</em>, 2024.'
    },
    {
      n: 11,
      text: 'Richard A. Detweiler, &ldquo;What Students Know About College That Critics Don&rsquo;t,&rdquo; <em>Inside Higher Ed</em>, September 2, 2026.'
    },
    {
      n: 12,
      text: 'Detweiler, pp. 191&ndash;192 and appendix 3, p. 241.'
    },
    {
      n: 13,
      text: 'Gallup and Strada Education Network, national alumni survey (2019), as cited in Richard A. Detweiler, <em>The Evidence Liberal Arts Needs: Lives of Consequence, Inquiry, and Accomplishment</em> (MIT Press, 2021), p. 191.'
    },
    {
      n: 14,
      text: 'Gallup-Strada National Alumni Survey, 2019.'
    },
    {
      n: 15,
      text: 'Gallup and Purdue University, <em>Great Jobs, Great Lives: The 2014 Gallup-Purdue Index Report</em> (2014).'
    },
    {
      n: 16,
      text: 'National Association of College and University Business Officers, <em>2025 Tuition Discounting Study</em> (2026), as reported by Higher Ed Dive.'
    },
    {
      n: 17,
      text: 'Detweiler, p. 104; tuition discounting: National Association of College and University Business Officers, <em>2025 Tuition Discounting Study</em> (2026).'
    },
    {
      n: 18,
      text: 'Graduate Management Admission Council, <em>Corporate Recruiters Survey</em> (2026).'
    },
    {
      n: 19,
      text: 'Steve Jobs, remarks introducing the Apple iPad 2, March 2, 2011.'
    },
    {
      n: 20,
      text: 'Mark Cuban, interview with Bloomberg, February 2017.'
    },
    {
      n: 21,
      text: 'Fareed Zakaria, <em>In Defense of a Liberal Education</em> (W. W. Norton, 2015).'
    },
    {
      n: 22,
      text: 'Raj Chetty, David J. Deming and John N. Friedman, &ldquo;Diversifying Society&rsquo;s Leaders? The Causal Effects of Admission to Highly Selective Private Colleges,&rdquo; NBER Working Paper No. 31492 (July 2023).'
    },
    {
      n: 23,
      text: 'Stacy Dale and Alan B. Krueger, &ldquo;Estimating the Effects of College Characteristics over the Career Using Administrative Earnings Data,&rdquo; <em>Journal of Human Resources</em> 49, no. 2 (2014): 323&ndash;358.'
    },
    {
      n: 24,
      text: 'Alexander W. Astin, <em>What Matters in College? Four Critical Years Revisited</em> (Jossey-Bass, 1993).'
    },
    {
      n: 25,
      text: 'Ernest T. Pascarella and Patrick T. Terenzini, <em>How College Affects Students</em>, vol. 2 (Jossey-Bass, 2005).'
    },
    {
      n: 26,
      text: 'Vincent Tinto, <em>Leaving College: Rethinking the Causes and Cures of Student Attrition</em>, 2nd ed. (University of Chicago Press, 1993).'
    },
    {
      n: 27,
      text: 'Gregory M. Walton and Geoffrey L. Cohen, &ldquo;A Brief Social-Belonging Intervention Improves Academic and Health Outcomes of Minority Students,&rdquo; <em>Science</em> 331 (2011): 1447&ndash;1451.'
    },
    {
      n: 28,
      text: 'Gregory M. Walton, Mary C. Murphy, Christine Logel and others, &ldquo;Where and with whom does a brief social-belonging intervention promote progress in college?&rdquo; <em>Science</em> 380 (2023): 499&ndash;505.'
    },
    {
      n: 29,
      text: 'Bureau of Labor Statistics, &ldquo;From age 18 to 38, Americans born 1957&ndash;64 held more jobs than those born 1980&ndash;84,&rdquo; <em>The Economics Daily</em>, May 12, 2026.'
    },
    {
      n: 30,
      text: 'Bureau of Labor Statistics, &ldquo;Baby boomers born from 1957 to 1964 held an average of 12.7 jobs from ages 18 to 56,&rdquo; <em>The Economics Daily</em>, January 3, 2024.'
    },
    {
      n: 31,
      text: 'Higher Education Opportunity Act of 2008 (P.L. 110-315).'
    },
    {
      n: 32,
      text: 'Association of American Colleges and Universities (AAC&amp;U), <em>How College Contributes to Workforce Success</em>, 2021.'
    }
  ],
  foundation: []
};

const pages = [
  {
    file: 'index.html',
    page: 'home',
    title: 'What College Is Really For',
    description: 'What kind of college education lasts a lifetime? It\u2019s not the major or the ranking. It\u2019s what happens there. Two-minute quizzes for students, parents, counselors, faculty, college leaders and policymakers.',
    socialDescription: 'What kind of college education lasts a lifetime? \u00b7 It\u2019s not the major. It\u2019s not the ranking. It\u2019s what happens there.',
    body: 'home.html',
    notes: siteNotes.home
  },
  {
    file: 'foundation.html',
    page: 'foundation',
    title: 'Foundation preview | What College Is Really For',
    description: 'A preview of the shared design system, components and accessibility patterns for the revised site.',
    body: 'foundation.html',
    robots: 'noindex,nofollow',
    notes: siteNotes.foundation
  },
  {
    file: 'what-matters.html',
    page: 'what-matters',
    title: 'What Matters in College: All the Findings | What College Is Really For',
    description: 'Every substantial finding from interviews with 1,000 college graduates: which college experiences were linked to leadership, civic involvement, continued learning, cultural involvement, fulfillment and success decades later.',
    body: 'what-matters.html',
    chart: chartHtml,
    notes: siteNotes['what-matters']
  },
  {
    file: 'the-research.html',
    page: 'research',
    title: 'The Research | What College Is Really For',
    description: 'How the study behind this site was done (sample, measures, analysis and controls), what it found, what it cannot show, and how it fits with other research on college.',
    body: 'the-research.html',
    notes: siteNotes.research
  },
  {
    file: 'tools/college-scorecard.html',
    page: 'choosing',
    title: 'Your College Scorecard | What College Is Really For',
    description: 'Compare your top colleges on what you will actually experience there, not what their websites say.',
    socialDescription: 'Compare your top colleges on what you will actually experience there, not what their websites say.',
    body: 'tools/college-scorecard.html',
    scripts: ['choosing-data.js', 'choosing.js'],
    notes: []
  },
  {
    file: 'tools/semester-plan.html',
    page: 'in-college',
    title: 'One-Semester Plan | What College Is Really For',
    description: 'Turn the five moves into three specific moves for this semester, with target dates and check-ins. Fill it in, save it in your browser, and print it.',
    body: 'tools/semester-plan.html',
    scripts: ['tools.js'],
    notes: siteNotes['semester-plan']
  },
  {
    file: 'tools/course-self-audit.html',
    page: 'faculty',
    title: 'Course Self-Audit | What College Is Really For',
    description: 'Look at one course you teach against the five practices in the study, and commit to one or two changes for next term. For your own reflection.',
    body: 'tools/course-self-audit.html',
    scripts: ['tools.js'],
    notes: siteNotes['course-self-audit']
  },
  {
    file: 'tools/leaders-checklist.html',
    page: 'leaders',
    title: 'Eight-Practice Checklist | What College Is Really For',
    description: 'See how many students get each of the eight practices, who owns each one, and what improving it would cost. Built for deans, chairs and trustees.',
    body: 'tools/leaders-checklist.html',
    scripts: ['tools.js'],
    notes: siteNotes['leaders-checklist']
  },
  {
    file: 'tools/policy-brief.html',
    page: 'policymakers',
    title: 'Policy Brief Generator | What College Is Really For',
    description: 'Build a formal legislative report request or committee briefing on long-term higher education outcomes, with model language and hearing questions.',
    body: 'tools/policy-brief.html',
    scripts: ['tools.js'],
    notes: siteNotes['policy-brief']
  },
  {
    file: 'choosing-a-college.html',
    page: 'choosing',
    title: 'Choosing a College | What College Is Really For',
    description: 'A two-minute quiz for high school students. Figure out what you want college to do for you, and get questions to ask, whether or not you can visit.',
    body: 'choosing-a-college.html',
    scripts: ['choosing-data.js', 'choosing.js'],
    notes: siteNotes.choosing
  },
  {
    file: 'in-college.html',
    page: 'in-college',
    title: 'In College | What College Is Really For',
    description: 'A two-minute check for college students. See which parts of college that last you already have, and plan the rest, one semester at a time.',
    body: 'in-college.html',
    scripts: ['in-college-data.js', 'in-college.js'],
    notes: siteNotes['in-college']
  },
  {
    file: 'parents.html',
    page: 'parents',
    title: 'Parents | What College Is Really For',
    description: 'For parents. What you hope college will give your child for the rest of their life, what it will really cost, and the questions to ask colleges and your child.',
    body: 'parents.html',
    scripts: ['parents-data.js', 'parents.js'],
    notes: siteNotes.parents
  },
  {
    file: 'faculty.html',
    page: 'faculty',
    title: 'Faculty | What College Is Really For',
    description: 'For professors, instructors and adjunct faculty, in person or online. Five teaching practices linked to graduates\u2019 lives decades later, mentoring that counts in a research career, a course self-audit and a workshop kit.',
    body: 'faculty.html',
    scripts: ['faculty-data.js', 'faculty.js'],
    notes: siteNotes.faculty
  },
  {
    file: 'college-leaders.html',
    page: 'leaders',
    title: 'College Leaders | What College Is Really For',
    description: 'For presidents, provosts, deans, chairs and trustees: check whether budgets, incentives and measures support the student experiences linked to graduates\u2019 lives, at every kind of institution.',
    body: 'college-leaders.html',
    scripts: ['college-leaders-data.js', 'college-leaders.js'],
    notes: siteNotes['college-leaders']
  },
  {
    file: 'counselors.html',
    page: 'counselors',
    title: 'Counselors | What College Is Really For',
    description: 'For high school counselors, college access advisers and independent counselors. A two-minute quiz on how you help students choose, questions that work with any student, and a free counselor kit.',
    body: 'counselors.html',
    scripts: ['counselors-data.js', 'counselors.js'],
    notes: siteNotes.counselors
  },
  {
    file: 'policymakers.html',
    page: 'policymakers',
    title: 'Policymakers | What College Is Really For',
    description: 'For legislators, members of Congress, governing boards and policy staff. The outcomes a state needs from college, the experiences that produce them, how to measure them over a lifetime, a state brief and a federal staff memo.',
    body: 'policymakers.html',
    scripts: ['policymakers-data.js', 'policymakers.js'],
    notes: siteNotes.policymakers
  },
  {
    file: 'understanding-college.html',
    page: 'understanding',
    title: 'Understanding College | What College Is Really For',
    description: 'How American colleges differ, where the liberal arts idea came from, what prestige and rankings do and don\u2019t tell you, and how to choose by evidence.',
    body: 'understanding-college.html',
    scripts: ['understanding.js'],
    notes: siteNotes.understanding
  },
  {
    file: 'about.html',
    page: 'about',
    title: 'About | What College Is Really For',
    description: 'About HigherEdImpact, the 501(c)(3) nonprofit that publishes What College Is Really For, and its Managing Director, Richard A. Detweiler, author of The Evidence Liberal Arts Needs.',
    body: 'about.html',
    notes: siteNotes.about
  },
  {
    file: 'privacy.html',
    page: 'privacy',
    title: 'Privacy | What College Is Really For',
    description: 'How What College Is Really For handles your information: no accounts, no personal information collected, quiz answers kept on your own device.',
    body: 'privacy.html',
    notes: siteNotes.privacy
  },
  {
    file: '404.html',
    page: 'not-found',
    title: 'Page not found | What College Is Really For',
    description: 'That page is not here. Start from the home page, the research, or the guide to understanding college.',
    body: '404.html',
    robots: 'noindex,follow',
    notes: []
  }
];

function qualifyNested(html) {
  return html.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/|data:|\.\.\/)(assets\/|scripts\/|styles\.css|[^"#\/]*\.html)/g, '$1="../$2');
}

function notesList(notes) {
  return notes
    .map(function (note) {
      return '<li id="note-' + note.n + '">' + note.text + '</li>';
    })
    .join('\n');
}

function notesPanel(notes) {
  if (!notes || !notes.length) return '';
  return render(notesPartial, {
    NOTES_LIST: notesList(notes),
    NOTES_COUNT: String(notes.length)
  });
}

const shell = '<!DOCTYPE html>\n<html lang="en">\n{{HEAD}}\n<body data-page="{{PAGE}}">\n{{HEADER}}\n<main id="main">\n{{BODY}}\n</main>\n{{FOOTER}}\n{{NOTES}}\n<script src="scripts/ui.js"></script>\n<script src="scripts/visual.js"></script>\n{{PAGE_SCRIPTS}}\n</body>\n</html>\n';

fs.mkdirSync(OUT, { recursive: true });

pages.forEach(function (page) {
  let body = read(path.join('pages', page.body));
  body = body.replace(/{{NUMBERS_NOTE}}/g, numbersNote);
  if (page.chart) body = body.replace('{{CHART}}', page.chart);

  let html = render(shell, {
    HEAD: render(head, {
      TITLE: page.title,
      DESCRIPTION: page.description,
      ROBOTS: page.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      OG_TYPE: 'website',
      SOCIAL_DESCRIPTION: page.socialDescription || page.description,
      SOCIAL_DESCRIPTION_ATTR: escapeAttr(page.socialDescription || page.description),
      SEO_TAGS: seoTags(page),
      TWITTER_IMAGE: twitterImageTag(page),
      JSON_LD: structuredData(page)
    }),
    PAGE: page.page,
    HEADER: header,
    BODY: body,
    FOOTER: footer,
    NOTES: notesPanel(page.notes),
    PAGE_SCRIPTS: (page.scripts || []).map(function (file) {
      return '<script src="scripts/' + file + '"></script>';
    }).join('\n')
  });

      if (page.file.indexOf('/') !== -1) html = qualifyNested(html);
    var outputPath = path.join(OUT, page.file);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log('built ' + page.file);
});

const cssFiles = ['fonts.css', 'tokens.css', 'base.css', 'layout.css', 'components.css', 'pages.css', 'in-college.css', 'parents.css', 'faculty.css', 'college-leaders.css', 'counselors.css', 'policymakers.css', 'understanding.css', 'tools.css', 'visual.css', 'refine.css'];
const css = cssFiles.map(function (file) { return read(path.join('styles', file)); }).join('\n');
fs.writeFileSync(path.join(OUT, 'styles.css'), css);
console.log('built styles.css');

fs.mkdirSync(path.join(OUT, 'scripts'), { recursive: true });
fs.copyFileSync(path.join(SRC, 'scripts', 'ui.js'), path.join(OUT, 'scripts', 'ui.js'));
console.log('built scripts/ui.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'visual.js'), path.join(OUT, 'scripts', 'visual.js'));
console.log('built scripts/visual.js');

const choosingData = read('data/choosing.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'choosing-data.js'), 'window.WCIRF_CHOOSING = ' + choosingData.trim() + ';\n');
console.log('built scripts/choosing-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'choosing.js'), path.join(OUT, 'scripts', 'choosing.js'));
console.log('built scripts/choosing.js');

const inCollegeData = read('data/in-college.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'in-college-data.js'), 'window.WCIRF_IN_COLLEGE = ' + inCollegeData.trim() + ';\n');
console.log('built scripts/in-college-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'in-college.js'), path.join(OUT, 'scripts', 'in-college.js'));
console.log('built scripts/in-college.js');

const parentsData = read('data/parents.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'parents-data.js'), 'window.WCIRF_PARENTS = ' + parentsData.trim() + ';\n');
console.log('built scripts/parents-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'parents.js'), path.join(OUT, 'scripts', 'parents.js'));
console.log('built scripts/parents.js');

const facultyData = read('data/faculty.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'faculty-data.js'), 'window.WCIRF_FACULTY = ' + facultyData.trim() + ';\n');
console.log('built scripts/faculty-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'faculty.js'), path.join(OUT, 'scripts', 'faculty.js'));
console.log('built scripts/faculty.js');

const collegeLeadersData = read('data/college-leaders.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'college-leaders-data.js'), 'window.WCIRF_LEADERS = ' + collegeLeadersData.trim() + ';\n');
console.log('built scripts/college-leaders-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'college-leaders.js'), path.join(OUT, 'scripts', 'college-leaders.js'));
console.log('built scripts/college-leaders.js');

const counselorsData = read('data/counselors.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'counselors-data.js'), 'window.WCIRF_COUNSELORS = ' + counselorsData.trim() + ';\n');
console.log('built scripts/counselors-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'counselors.js'), path.join(OUT, 'scripts', 'counselors.js'));
console.log('built scripts/counselors.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'tools.js'), path.join(OUT, 'scripts', 'tools.js'));
console.log('built scripts/tools.js');

const downloadsSource = path.join(SRC, 'downloads');
if (fs.existsSync(downloadsSource)) {
  fs.cpSync(downloadsSource, path.join(OUT, 'downloads'), { recursive: true });
  const downloadFiles = fs.readdirSync(downloadsSource).filter(function (name) { return /\.pdf$/i.test(name); });
  console.log('copied downloads (' + downloadFiles.length + ' PDFs)');
}

const policymakersData = read('data/policymakers.json');
fs.writeFileSync(path.join(OUT, 'scripts', 'policymakers-data.js'), 'window.WCIRF_POLICYMAKERS = ' + policymakersData.trim() + ';\n');
console.log('built scripts/policymakers-data.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'policymakers.js'), path.join(OUT, 'scripts', 'policymakers.js'));
console.log('built scripts/policymakers.js');

fs.copyFileSync(path.join(SRC, 'scripts', 'understanding.js'), path.join(OUT, 'scripts', 'understanding.js'));
console.log('built scripts/understanding.js');

fs.cpSync(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });
console.log('copied assets');

const sitemapPages = pages.filter(function (page) { return !page.robots; });
if (siteUrl) {
  const urls = sitemapPages.map(function (page) {
    return '  <url>\n    <loc>' + escapeAttr(absoluteUrl(pageRoute(page.file))) + '</loc>\n    <changefreq>' + (page.file === 'index.html' ? 'weekly' : 'monthly') + '</changefreq>\n  </url>';
  });
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
  console.log('built sitemap.xml (' + sitemapPages.length + ' pages)');
} else {
  const staleSitemap = path.join(OUT, 'sitemap.xml');
  if (fs.existsSync(staleSitemap)) fs.unlinkSync(staleSitemap);
  console.log('NOTE: no SITE_URL set, so canonical URLs, structured data, social images and sitemap.xml were skipped.');
}

const robots = 'User-agent: *\nAllow: /\nDisallow: /foundation.html\n' + (siteUrl ? '\nSitemap: ' + absoluteUrl('sitemap.xml') + '\n' : '');
fs.writeFileSync(path.join(OUT, 'robots.txt'), robots);
console.log('built robots.txt');

// root favicon fallback (browsers request /favicon.ico directly)
fs.copyFileSync(path.join(OUT, 'assets', 'favicon.ico'), path.join(OUT, 'favicon.ico'));
console.log('built favicon.ico');

const manifest = {
  name: 'What College Is Really For',
  short_name: 'College',
  description: 'What college is really for, from interviews with 1,000 graduates.',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#fdfcfb',
  theme_color: '#1b365d',
  icons: [
    { src: 'favicon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'favicon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
fs.writeFileSync(path.join(OUT, 'assets', 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
console.log('built assets/site.webmanifest');
