var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// functions/ai-contact-analyzer.js
var SENSITIVE_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  creditCard: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  apiKey: /\b(api[_-]?key|token|secret|password)[\s]*[:=][\s]*['"]?[A-Za-z0-9._-]{10,}['"]?/gi,
  oauth: /\b(oauth|bearer)[\s]*[:=][\s]*['"]?[A-Za-z0-9._-]{20,}['"]?/gi
};
var RATE_LIMITS = {
  requestsPerMinute: 5,
  // Reduced from 10 for anonymous traffic
  requestsPerHour: 20,
  burstLimit: 3
};
var ANALYSIS_SCHEMA = {
  inquiryType: ["consultation", "project", "partnership", "general", "urgent"],
  priorityLevel: ["high", "medium", "low"],
  industry: ["technology", "healthcare", "finance", "manufacturing", "other"],
  projectScope: ["small", "medium", "large", "enterprise"],
  urgency: ["immediate", "soon", "flexible"],
  meetingType: ["consultation", "project-planning", "technical-review", "strategy-session", "general-discussion"],
  confidence: { min: 0, max: 1 },
  redFlags: { type: "array", maxLength: 5 },
  followUpQuestions: { type: "array", maxLength: 3 }
};
function addCorsHeaders(response, status = 200) {
  const headers = new Headers(response.headers || {});
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  return new Response(response.body, {
    status,
    headers
  });
}
__name(addCorsHeaders, "addCorsHeaders");
function scrubSensitiveData(text) {
  if (!text || typeof text !== "string") return text;
  let scrubbed = text;
  Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
    scrubbed = scrubbed.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
  });
  const suspiciousPatterns = [
    /\b(crypto|bitcoin|ethereum|wallet)\b/gi,
    /\b(seo|backlink|ranking|traffic)\b/gi,
    /\b(loan|mortgage|refinance|debt)\b/gi,
    /(https?:\/\/[^\s]+)/g,
    // URLs
    /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g
    // Emails again
  ];
  suspiciousPatterns.forEach((pattern) => {
    scrubbed = scrubbed.replace(pattern, "[SUSPICIOUS_CONTENT]");
  });
  return scrubbed;
}
__name(scrubSensitiveData, "scrubSensitiveData");
async function checkRateLimit(request, env) {
  if (!env.KV) {
    console.warn("KV not available, skipping rate limiting");
    return true;
  }
  const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
  const now = Date.now();
  const minuteKey = `rate_limit:${clientIP}:${Math.floor(now / 6e4)}`;
  const hourKey = `rate_limit:${clientIP}:${Math.floor(now / 36e5)}`;
  try {
    const [minuteCount, hourCount] = await Promise.all([
      env.KV.get(minuteKey, { type: "text" }).then((v) => parseInt(v) || 0),
      env.KV.get(hourKey, { type: "text" }).then((v) => parseInt(v) || 0)
    ]);
    if (minuteCount >= RATE_LIMITS.requestsPerMinute) {
      throw new Error("Rate limit exceeded: too many requests per minute");
    }
    if (hourCount >= RATE_LIMITS.requestsPerHour) {
      throw new Error("Rate limit exceeded: too many requests per hour");
    }
    await Promise.all([
      env.KV.put(minuteKey, (minuteCount + 1).toString(), { expirationTtl: 60 }),
      env.KV.put(hourKey, (hourCount + 1).toString(), { expirationTtl: 3600 })
    ]);
    return true;
  } catch (error) {
    if (error.message.includes("Rate limit exceeded")) {
      throw error;
    }
    console.warn("Rate limiting unavailable, allowing request");
    return true;
  }
}
__name(checkRateLimit, "checkRateLimit");
function validateInput(data) {
  console.log("\u{1F50D} Validating input data:", JSON.stringify(data, null, 2));
  const { name, email, company, subject, message, consent } = data;
  console.log("\u{1F50D} Extracted fields:", { name, email, company, subject, message, consent });
  if (!name || !subject || !message) {
    console.error("\u274C Missing required fields:", { name: !!name, subject: !!subject, message: !!message });
    throw new Error("Missing required fields");
  }
  if (!consent || consent !== "true") {
    throw new Error("Explicit consent required for AI analysis");
  }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }
  if (data.honeypot && data.honeypot.trim() !== "") {
    throw new Error("Form submission rejected");
  }
  const sanitize = /* @__PURE__ */ __name((str) => {
    if (!str || typeof str !== "string") return "";
    return str.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "").trim().substring(0, 1e3);
  }, "sanitize");
  const sanitized = {
    name: sanitize(name),
    email: email ? sanitize(email) : "",
    company: company ? sanitize(company) : "",
    subject: sanitize(subject),
    message: sanitize(message)
  };
  if (sanitized.name.length < 2 || sanitized.name.length > 100) {
    throw new Error("Invalid name length");
  }
  if (sanitized.subject.length < 5 || sanitized.subject.length > 200) {
    throw new Error("Invalid subject length");
  }
  if (sanitized.message.length < 20 || sanitized.message.length > 2e3) {
    throw new Error("Invalid message length");
  }
  return sanitized;
}
__name(validateInput, "validateInput");
function validateAIResponse(response) {
  try {
    if (!response || typeof response !== "object") {
      throw new Error("Invalid response format");
    }
    const required = ["inquiryType", "priorityLevel", "industry", "projectScope", "urgency"];
    for (const field of required) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    if (!ANALYSIS_SCHEMA.inquiryType.includes(response.inquiryType)) {
      response.inquiryType = "general";
    }
    if (!ANALYSIS_SCHEMA.priorityLevel.includes(response.priorityLevel)) {
      response.priorityLevel = "medium";
    }
    if (!ANALYSIS_SCHEMA.industry.includes(response.industry)) {
      response.industry = "other";
    }
    if (!ANALYSIS_SCHEMA.projectScope.includes(response.projectScope)) {
      response.projectScope = "medium";
    }
    if (!ANALYSIS_SCHEMA.urgency.includes(response.urgency)) {
      response.urgency = "flexible";
    }
    if (typeof response.confidence !== "number" || response.confidence < ANALYSIS_SCHEMA.confidence.min || response.confidence > ANALYSIS_SCHEMA.confidence.max) {
      response.confidence = 0.7;
    }
    if (!Array.isArray(response.redFlags)) {
      response.redFlags = [];
    } else {
      response.redFlags = response.redFlags.slice(0, ANALYSIS_SCHEMA.redFlags.maxLength);
    }
    if (!Array.isArray(response.followUpQuestions)) {
      response.followUpQuestions = [];
    } else {
      response.followUpQuestions = response.followUpQuestions.filter((question) => {
        if (!question || typeof question !== "string") return false;
        const questionLower = question.toLowerCase().trim();
        if (questionLower.includes("1-3") || questionLower.includes("clarifying questions if needed")) return false;
        if (questionLower.includes("array of") || questionLower.includes("security concerns if any")) return false;
        if (questionLower.includes("specific question") && questionLower.match(/specific question \d+/)) return false;
        if (questionLower.includes("follow-up questions") && questionLower.includes("if needed")) return false;
        if (questionLower.includes("questions if needed")) return false;
        if (questionLower.includes("clarifying questions")) return false;
        if (question.length < 10) return false;
        if (questionLower === "questions" || questionLower === "follow-ups" || questionLower === "followups") return false;
        return question.trim().length > 0;
      }).slice(0, ANALYSIS_SCHEMA.followUpQuestions.maxLength);
    }
    return response;
  } catch (error) {
    throw new Error(`AI response validation failed: ${error.message}`);
  }
}
__name(validateAIResponse, "validateAIResponse");
function calculateConfidence({ name, email, company, subject, message, analysis: analysis2 }) {
  let confidence = 0;
  if (name && name.trim().length > 0) confidence += 0.12;
  if (email && email.includes("@") && email.includes(".")) confidence += 0.13;
  if (subject && subject.trim().length > 0) confidence += 0.1;
  const messageLength = message.trim().length;
  if (messageLength >= 100) confidence += 0.35;
  else if (messageLength >= 80) confidence += 0.3;
  else if (messageLength >= 60) confidence += 0.25;
  else if (messageLength >= 40) confidence += 0.2;
  else if (messageLength >= 30) confidence += 0.15;
  else if (messageLength >= 20) confidence += 0.1;
  else confidence += 0.05;
  if (company && company.trim().length > 0) confidence += 0.1;
  const emailDomain = email ? email.split("@")[1] || "" : "";
  if (emailDomain && emailDomain !== "gmail.com" && emailDomain !== "yahoo.com" && emailDomain !== "hotmail.com") {
    confidence += 0.05;
  }
  const subjectWords = subject.trim().split(" ").length;
  if (subjectWords >= 5) confidence += 0.05;
  else if (subjectWords >= 3) confidence += 0.03;
  else confidence += 0.01;
  const hasProjectKeywords = /project|development|implementation|integration|modernization|migration|consultation|strategy/i.test(message);
  const hasTechnicalTerms = /api|database|cloud|saas|devops|ci\/cd|automation|system|platform|web|app|application/i.test(message);
  const hasBusinessTerms = /business|enterprise|company|organization|team|leadership|management|process|startup/i.test(message);
  if (hasProjectKeywords) confidence += 0.03;
  if (hasTechnicalTerms) confidence += 0.03;
  if (hasBusinessTerms) confidence += 0.04;
  if (analysis2.inquiryType && analysis2.inquiryType !== "general") confidence += 0.02;
  if (analysis2.industry && analysis2.industry !== "other") confidence += 0.02;
  if (analysis2.projectScope && analysis2.projectScope !== "medium") confidence += 0.01;
  if (messageLength < 20) confidence -= 0.25;
  else if (messageLength < 40) confidence -= 0.2;
  else if (messageLength < 60) confidence -= 0.15;
  else if (messageLength < 80) confidence -= 0.1;
  if (messageLength > 0 && !/[.!?]$/.test(message.trim())) {
    confidence -= 0.2;
  }
  if (messageLength < 50 && !/[.!?]$/.test(message.trim())) {
    confidence -= 0.15;
  }
  if (subjectWords < 2) confidence -= 0.03;
  if (emailDomain && (emailDomain === "gmail.com" || emailDomain === "yahoo.com" || emailDomain === "hotmail.com")) {
    confidence -= 0.02;
  }
  confidence = Math.min(Math.max(confidence, 0.1), 1);
  return Math.round(confidence * 100) / 100;
}
__name(calculateConfidence, "calculateConfidence");
function parseAIResponse(aiResponse) {
  try {
    let jsonText = aiResponse;
    if (typeof aiResponse === "string") {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      } else if (aiResponse.includes("{") && aiResponse.includes("}")) {
        const startBrace = aiResponse.indexOf("{");
        const endBrace = aiResponse.lastIndexOf("}");
        if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
          jsonText = aiResponse.substring(startBrace, endBrace + 1);
        }
      }
      if (!jsonText.match(/^\{.*\}$/s)) {
        const jsonObjects = aiResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
        if (jsonObjects && jsonObjects.length > 0) {
          jsonText = jsonObjects.reduce(
            (longest, current) => current.length > longest.length ? current : longest
          );
        }
      }
      jsonText = jsonText.replace(/^```.*$/gm, "").replace(/^`.*`$/gm, "").trim();
      jsonText = jsonText.replace(/^Here's the analysis:/i, "");
      jsonText = jsonText.replace(/^Analysis:/i, "");
      jsonText = jsonText.replace(/^Response:/i, "");
      jsonText = jsonText.replace(/^JSON:/i, "");
      jsonText = jsonText.replace(/^Here is the JSON:/i, "");
      jsonText = jsonText.trim();
    }
    const result = JSON.parse(jsonText);
    if (!result || typeof result !== "object") {
      throw new Error("AI response is not a valid object");
    }
    return result;
  } catch (parseError) {
    console.warn("Failed to parse AI response as JSON:", parseError.message);
    console.warn("Raw AI response was:", aiResponse);
    throw new Error("Invalid AI response format");
  }
}
__name(parseAIResponse, "parseAIResponse");
var ai_contact_analyzer_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      console.log("CORS preflight request received");
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    if (request.method === "GET") {
      return addCorsHeaders(new Response(JSON.stringify({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        cors: "enabled"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }));
    }
    if (request.method !== "POST") {
      return addCorsHeaders(new Response("Method not allowed", {
        status: 405,
        headers: { "Content-Type": "text/plain" }
      }));
    }
    try {
      await checkRateLimit(request, env);
      const rawData = await request.json();
      console.log("\u{1F4E5} Received data:", JSON.stringify(rawData, null, 2));
      const { name, email, company, subject, message } = validateInput(rawData);
      const scrubbedMessage = scrubSensitiveData(message);
      const scrubbedSubject = scrubSensitiveData(subject);
      const suspiciousPatterns = [
        /\b(crypto|bitcoin|ethereum|wallet)\b/gi,
        /\b(seo|backlink|ranking|traffic)\b/gi,
        /\b(loan|mortgage|refinance|debt)\b/gi,
        /(https?:\/\/[^\s]+)/g,
        /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g
      ];
      const redFlags = [];
      suspiciousPatterns.forEach((pattern) => {
        if (pattern.test(scrubbedMessage + " " + scrubbedSubject)) {
          redFlags.push("suspicious_content_detected");
        }
      });
      if (redFlags.length > 2) {
        return addCorsHeaders(new Response(JSON.stringify({
          inquiryType: "general",
          priorityLevel: "low",
          industry: "other",
          projectScope: "small",
          urgency: "flexible",
          suggestedResponse: "Thank you for your message. I'll review it and get back to you soon.",
          relevantContent: ["general portfolio"],
          shouldScheduleMeeting: false,
          meetingType: "general-discussion",
          recommendedTimeSlots: ["morning", "afternoon"],
          timezoneConsideration: "user's local timezone",
          followUpRequired: false,
          redFlags,
          followUpQuestions: [],
          confidence: 0.3,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          originalMessage: "[CONTENT_REVIEWED]",
          wordCount: 0,
          hasCompany: !!company,
          emailDomain: email ? email.split("@")[1] || "unknown" : "unknown",
          fallback: true
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }));
      }
      const messageLower = scrubbedMessage.toLowerCase();
      const subjectLower = scrubbedSubject.toLowerCase();
      let deterministicDuration = "1 hour";
      const hasUrgentKeywords = /urgent|asap|immediately|emergency|critical|deadline|rush/i.test(messageLower + " " + subjectLower);
      const hasComplexKeywords = /complex|complicated|detailed|comprehensive|extensive|multiple|several|various/i.test(messageLower);
      const hasProjectKeywords = /project|development|implementation|integration|migration|modernization|strategy|planning/i.test(messageLower);
      const hasTechnicalKeywords = /technical|architecture|system|platform|api|database|infrastructure|devops/i.test(messageLower);
      const hasSimpleKeywords = /quick|simple|basic|question|inquiry|discussion|chat/i.test(messageLower);
      if (hasUrgentKeywords || hasComplexKeywords || hasProjectKeywords && hasTechnicalKeywords) {
        deterministicDuration = "2 hours";
      } else if (hasProjectKeywords || hasTechnicalKeywords) {
        deterministicDuration = "1.5 hours";
      } else if (hasSimpleKeywords) {
        deterministicDuration = "30 minutes";
      } else {
        deterministicDuration = "1 hour";
      }
      let aiResponse;
      try {
        aiResponse = await env.ai.run("@cf/meta/llama-2-7b-chat-int8", {
          messages: [{
            role: "user",
            content: `Analyze: ${name} (${company || "N/A"}) - ${scrubbedSubject}
Message: ${scrubbedMessage}

Return JSON:
{
  "inquiryType": "consultation|project|partnership|general|urgent",
  "priorityLevel": "high|medium|low",
  "industry": "technology|healthcare|finance|manufacturing|other", 
  "projectScope": "small|medium|large|enterprise",
  "urgency": "immediate|soon|flexible",
  "shouldScheduleMeeting": true/false,
  "meetingType": "consultation|project-planning|technical-review|strategy-session|general-discussion",
  "followUpQuestions": ["2-3 specific questions about missing info"]
}`
          }],
          temperature: 0.1,
          max_tokens: 300
          // Limit response size to reduce neurons
        });
      } catch (aiError) {
        console.error("AI service error:", aiError);
        const messageLower2 = scrubbedMessage.toLowerCase();
        const subjectLower2 = scrubbedSubject.toLowerCase();
        let inquiryType = "general";
        let priorityLevel = "medium";
        let shouldScheduleMeeting = false;
        let meetingDuration = "1 hour";
        const hasUrgentKeywords2 = /urgent|asap|immediately|emergency|critical|deadline|rush/i.test(messageLower2 + " " + subjectLower2);
        if (hasUrgentKeywords2) {
          priorityLevel = "high";
          inquiryType = "urgent";
          shouldScheduleMeeting = true;
          meetingDuration = "2 hours";
        }
        const hasProjectKeywords2 = /project|development|implementation|integration|migration|modernization|strategy|planning/i.test(messageLower2);
        if (hasProjectKeywords2) {
          inquiryType = "project";
          shouldScheduleMeeting = true;
          meetingDuration = "1.5 hours";
        }
        const hasConsultationKeywords = /consultation|advice|guidance|help|support|discussion/i.test(messageLower2);
        if (hasConsultationKeywords) {
          inquiryType = "consultation";
          shouldScheduleMeeting = true;
          meetingDuration = "1 hour";
        }
        const basicFollowUps = [];
        const hasTimeline = /timeline|deadline|schedule|when|time|duration/i.test(messageLower2);
        const hasTeamSize = /team|team size|developers|staff|people|employees|users/i.test(messageLower2);
        const hasBudget = /budget|cost|price|investment|funding/i.test(messageLower2);
        const hasTechnicalDetails = /technology|tech stack|framework|platform|api|database|infrastructure/i.test(messageLower2);
        const hasBusinessContext = /business|company|industry|sector|market|customers/i.test(messageLower2);
        const hasSpecificGoals = /goals|objectives|outcomes|results|success|metrics/i.test(messageLower2);
        if (!hasTimeline) {
          basicFollowUps.push("What's your timeline for this project?");
        }
        if (!hasTeamSize) {
          basicFollowUps.push("How large is your team or organization?");
        }
        if (!hasTechnicalDetails && (hasProjectKeywords2 || hasTechnicalKeywords)) {
          basicFollowUps.push("What technologies or platforms are you currently using?");
        }
        if (!hasBusinessContext) {
          basicFollowUps.push("What industry or business context should I understand?");
        }
        if (!hasSpecificGoals) {
          basicFollowUps.push("What specific outcomes are you looking to achieve?");
        }
        if (basicFollowUps.length < 2) {
          if (basicFollowUps.length === 0) {
            basicFollowUps.push("What specific challenge are you facing?");
          }
          basicFollowUps.push("How can I best help you achieve your goals?");
        }
        analysis = {
          inquiryType,
          priorityLevel,
          industry: "other",
          projectScope: "medium",
          urgency: hasUrgentKeywords2 ? "immediate" : "flexible",
          suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
          relevantContent: ["general portfolio"],
          confidence: 0.6,
          shouldScheduleMeeting,
          meetingType: shouldScheduleMeeting ? "general-discussion" : "consultation",
          meetingDuration: "1 hour",
          recommendedTimeSlots: ["morning", "afternoon"],
          timezoneConsideration: "user's local timezone",
          userTimezone: "America/New_York",
          followUpRequired: shouldScheduleMeeting,
          redFlags,
          followUpQuestions: basicFollowUps,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          originalMessage: "[CONTENT_ANALYZED]",
          wordCount: scrubbedMessage.split(" ").length,
          hasCompany: !!company,
          emailDomain: email ? email.split("@")[1] || "unknown" : "unknown",
          fallback: true
        };
        aiResponse = null;
      }
      if (aiResponse) {
        try {
          analysis = parseAIResponse(aiResponse.response);
          analysis = validateAIResponse(analysis);
        } catch (parseError) {
          console.error("AI response parsing error:", parseError);
          const basicFollowUps = ["What specific challenge are you facing?", "How can I best help you achieve your goals?"];
          analysis = {
            inquiryType: "general",
            priorityLevel: "medium",
            industry: "other",
            projectScope: "medium",
            urgency: "flexible",
            messageType: "meeting-request",
            meetingDuration: "1 hour",
            suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
            relevantContent: ["general portfolio"],
            confidence: 0.6,
            shouldScheduleMeeting: true,
            meetingType: "general-discussion",
            recommendedTimeSlots: ["morning", "afternoon"],
            timezoneConsideration: "user's local timezone",
            userTimezone: "America/New_York",
            followUpRequired: true,
            redFlags,
            followUpQuestions: basicFollowUps,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            originalMessage: "[CONTENT_ANALYZED]",
            wordCount: scrubbedMessage.split(" ").length,
            hasCompany: !!company,
            emailDomain: email ? email.split("@")[1] || "unknown" : "unknown",
            fallback: true
          };
        }
      } else {
        const basicFollowUps = ["What specific challenge are you facing?", "How can I best help you achieve your goals?"];
        analysis = {
          inquiryType: "general",
          priorityLevel: "medium",
          industry: "other",
          projectScope: "medium",
          urgency: "flexible",
          messageType: "message",
          meetingDuration: "1 hour",
          suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
          relevantContent: ["general portfolio"],
          confidence: 0.6,
          shouldScheduleMeeting: false,
          meetingType: "general-discussion",
          recommendedTimeSlots: ["morning", "afternoon"],
          timezoneConsideration: "user's local timezone",
          userTimezone: "America/New_York",
          followUpRequired: false,
          redFlags,
          followUpQuestions: basicFollowUps,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          originalMessage: "[CONTENT_ANALYZED]",
          wordCount: scrubbedMessage.split(" ").length,
          hasCompany: !!company,
          emailDomain: email ? email.split("@")[1] || "unknown" : "unknown",
          fallback: true
        };
      }
      const defaultAnalysis = {
        inquiryType: "general",
        priorityLevel: "medium",
        industry: "other",
        projectScope: "medium",
        urgency: "flexible",
        messageType: "message",
        meetingDuration: "1 hour",
        suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
        relevantContent: ["general portfolio"],
        confidence: 0.8,
        shouldScheduleMeeting: false,
        meetingType: "general-discussion",
        recommendedTimeSlots: ["morning", "afternoon"],
        timezoneConsideration: "user's local timezone",
        userTimezone: "America/New_York",
        followUpRequired: false,
        redFlags: [],
        followUpQuestions: [],
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        originalMessage: "[CONTENT_ANALYZED]",
        wordCount: scrubbedMessage.split(" ").length,
        hasCompany: !!company,
        emailDomain: email ? email.split("@")[1] || "unknown" : "unknown"
      };
      delete analysis.confidence;
      analysis = { ...defaultAnalysis, ...analysis };
      analysis.meetingDuration = deterministicDuration;
      if (analysis.suggestedResponse) {
        const baseResponse = analysis.suggestedResponse.replace(/for \d+ (minutes?|hours?|hours?)/gi, "").replace(/in \d+ (minutes?|hours?|hours?)/gi, "").replace(/a \d+ (minutes?|hours?|hours?) meeting/gi, "").trim();
        analysis.suggestedResponse = `${baseResponse} I'd be happy to schedule a ${deterministicDuration} meeting to discuss this further.`;
      }
      const enhancedAnalysis = {
        ...analysis,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        originalMessage: "[CONTENT_ANALYZED]",
        // Don't store original message
        wordCount: scrubbedMessage.split(" ").length,
        hasCompany: !!company,
        emailDomain: email ? email.split("@")[1] || "unknown" : "unknown",
        fallback: false
        // Explicitly mark as successful AI analysis
      };
      enhancedAnalysis.confidence = calculateConfidence({
        name,
        email,
        company,
        subject: scrubbedSubject,
        message: scrubbedMessage,
        analysis: enhancedAnalysis
      });
      console.log(`AI analysis completed: ${Date.now()} - confidence: ${enhancedAnalysis.confidence} - redFlags: ${redFlags.length}`);
      return addCorsHeaders(new Response(JSON.stringify(enhancedAnalysis), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }));
    } catch (error) {
      console.error(`AI analysis error: ${error.message} - timestamp: ${Date.now()}`);
      return addCorsHeaders(new Response(JSON.stringify({
        error: error.message || "AI analysis failed",
        fallback: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }));
    }
  }
};
export {
  ai_contact_analyzer_default as default
};
//# sourceMappingURL=ai-contact-analyzer.js.map
