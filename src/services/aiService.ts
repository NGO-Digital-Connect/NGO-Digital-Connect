import type { CaseUrgency, HelpRequest, Project, VolunteerOpportunity, UserAccount } from '../types/models';

export interface AiCategoryPrediction {
  predictedCategory: string;
  predictedUrgency: CaseUrgency;
  confidence: number;
  suggestedSupportType: 'FINANCIAL' | 'MEDICAL' | 'FOOD_RATION' | 'EDUCATION' | 'SHELTER' | 'EQUIPMENT' | 'VOLUNTEER_HELP';
  reasoning: string;
}

export const AiService = {
  /**
   * Natural Language Intake Classifier
   * Analyzes free-form user descriptions and tags them automatically.
   */
  classifyRequestDescription: (text: string): AiCategoryPrediction => {
    const lower = text.toLowerCase();

    // Healthcare detection
    if (lower.includes('hospital') || lower.includes('surgery') || lower.includes('doctor') || 
        lower.includes('medicine') || lower.includes('cardiac') || lower.includes('cancer') || 
        lower.includes('treatment') || lower.includes('health')) {
      const isCritical = lower.includes('emergency') || lower.includes('heart') || lower.includes('life') || lower.includes('immediate');
      return {
        predictedCategory: 'healthcare',
        predictedUrgency: isCritical ? 'CRITICAL' : 'HIGH',
        confidence: 0.94,
        suggestedSupportType: 'MEDICAL',
        reasoning: 'Detected clinical terms and acute medical urgency requiring verified hospital intervention.'
      };
    }

    // Education detection
    if (lower.includes('school') || lower.includes('fees') || lower.includes('book') || 
        lower.includes('student') || lower.includes('tuition') || lower.includes('college') || lower.includes('teacher')) {
      return {
        predictedCategory: 'education',
        predictedUrgency: lower.includes('expel') || lower.includes('dropout') ? 'HIGH' : 'MEDIUM',
        confidence: 0.91,
        suggestedSupportType: 'EDUCATION',
        reasoning: 'Detected scholastic terms and academic fee/material requirements.'
      };
    }

    // Food & Nutrition
    if (lower.includes('ration') || lower.includes('food') || lower.includes('hunger') || 
        lower.includes('meal') || lower.includes('grain') || lower.includes('starv')) {
      return {
        predictedCategory: 'food_nutrition',
        predictedUrgency: 'HIGH',
        confidence: 0.89,
        suggestedSupportType: 'FOOD_RATION',
        reasoning: 'Detected nutrition vulnerability requiring immediate essential dry ration packaging.'
      };
    }

    // Disaster Relief
    if (lower.includes('flood') || lower.includes('cyclone') || lower.includes('storm') || 
        lower.includes('earthquake') || lower.includes('damage') || lower.includes('shelter')) {
      return {
        predictedCategory: 'disaster_relief',
        predictedUrgency: 'CRITICAL',
        confidence: 0.96,
        suggestedSupportType: 'SHELTER',
        reasoning: 'Detected climate or natural calamity impact requiring urgent rapid-deployment relief.'
      };
    }

    // Environment & Water
    if (lower.includes('water') || lower.includes('solar') || lower.includes('soil') || 
        lower.includes('tree') || lower.includes('farm') || lower.includes('pollution')) {
      return {
        predictedCategory: 'environment',
        predictedUrgency: 'MEDIUM',
        confidence: 0.88,
        suggestedSupportType: 'EQUIPMENT',
        reasoning: 'Detected community environmental or eco-infrastructure requirements.'
      };
    }

    // Default fallback
    return {
      predictedCategory: 'women_children',
      predictedUrgency: 'MEDIUM',
      confidence: 0.75,
      suggestedSupportType: 'FINANCIAL',
      reasoning: 'General community welfare need detected from natural language input.'
    };
  },

  /**
   * Smart Matching: Recommend Top NGOs for a specific Help Request
   */
  matchNgosForCase: (helpRequest: HelpRequest, ngos: UserAccount[]): { ngo: UserAccount; matchScore: number; matchReasons: string[] }[] => {
    return ngos
      .filter(n => n.role === 'NGO' && n.profile.ngoDetails?.verificationStatus === 'VERIFIED')
      .map(ngo => {
        let score = 50;
        const reasons: string[] = [];
        const details = ngo.profile.ngoDetails;

        if (details?.causes.includes(helpRequest.category)) {
          score += 35;
          reasons.push(`Specialized focus in ${helpRequest.category}`);
        }

        if (details?.serviceAreas.includes(helpRequest.location.city) || details?.serviceAreas.includes(helpRequest.location.state)) {
          score += 25;
          reasons.push(`Active field operations in ${helpRequest.location.city}`);
        }

        if (helpRequest.urgency === 'CRITICAL' && details?.activeProjectCount && details.activeProjectCount > 0) {
          score += 15;
          reasons.push('High response readiness for critical priority');
        }

        return {
          ngo,
          matchScore: Math.min(score, 99),
          matchReasons: reasons
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Smart Matching: Recommend Opportunities for a Volunteer
   */
  matchOpportunitiesForVolunteer: (
    skills: string[],
    causes: string[],
    opportunities: VolunteerOpportunity[]
  ): { opp: VolunteerOpportunity; score: number; matchReasons: string[] }[] => {
    return opportunities
      .filter(o => o.status === 'OPEN')
      .map(opp => {
        let score = 40;
        const reasons: string[] = [];

        // Check causes
        if (causes.includes(opp.cause)) {
          score += 30;
          reasons.push(`Matches your cause interest in ${opp.cause}`);
        }

        // Check skills overlap
        const matchingSkills = opp.skillsRequired.filter(s => skills.includes(s));
        if (matchingSkills.length > 0) {
          score += 30;
          reasons.push(`Matches your verified skills: ${matchingSkills.join(', ')}`);
        }

        // Capacity availability bonus
        if (opp.slotsFilled < opp.slotsTotal) {
          score += 10;
        }

        return {
          opp,
          score: Math.min(score, 98),
          matchReasons: reasons
        };
      })
      .sort((a, b) => b.score - a.score);
  },

  /**
   * NGO Operational Assistant Copilot
   */
  queryNgoAssistant: (
    prompt: string,
    cases: HelpRequest[],
    projects: Project[],
    opportunities: VolunteerOpportunity[],
    ngoId: string
  ): string => {
    const q = prompt.toLowerCase();
    const ngoCases = cases.filter(c => c.assignedNgoId === ngoId);
    const ngoProjects = projects.filter(p => p.ngoId === ngoId);
    const ngoOpps = opportunities.filter(o => o.ngoId === ngoId);

    if (q.includes('priority') || q.includes('urgent') || q.includes('unresolved')) {
      const urgent = ngoCases.filter(c => (c.urgency === 'CRITICAL' || c.urgency === 'HIGH') && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
      if (urgent.length === 0) return 'Great news! You have no unresolved high or critical priority cases at this moment.';
      return `You have ${urgent.length} urgent case(s) requiring attention: ${urgent.map(c => `"${c.title}" [${c.urgency} - ${c.status}]`).join('; ')}.`;
    }

    if (q.includes('underfund') || q.includes('budget') || q.includes('funding')) {
      const underfunded = ngoProjects.filter(p => p.fundingRaised < p.fundingTarget);
      if (underfunded.length === 0) return 'All your active projects have successfully met their funding targets!';
      return `You have ${underfunded.length} project(s) below target: ${underfunded.map(p => `"${p.title}" (₹${p.fundingRaised.toLocaleString('en-IN')} / ₹${p.fundingTarget.toLocaleString('en-IN')} - ${Math.round((p.fundingRaised / p.fundingTarget) * 100)}%)`).join(', ')}.`;
    }

    if (q.includes('volunteer') || q.includes('slot') || q.includes('staff')) {
      const totalNeeded = ngoOpps.reduce((sum, o) => sum + o.slotsTotal, 0);
      const totalFilled = ngoOpps.reduce((sum, o) => sum + o.slotsFilled, 0);
      return `Across your ${ngoOpps.length} active volunteer opportunities, you have filled ${totalFilled} out of ${totalNeeded} required volunteer slots (${totalNeeded - totalFilled} slots currently open).`;
    }

    if (q.includes('milestone') || q.includes('progress') || q.includes('update')) {
      const pendingMilestones = ngoProjects.flatMap(p => p.milestones.filter(m => !m.isCompleted));
      return `You have ${pendingMilestones.length} upcoming milestones pending completion across your active initiatives.`;
    }

    return `Operational Overview: You are managing ${ngoCases.length} assigned cases, ${ngoProjects.length} active social projects, and ${ngoOpps.length} volunteer opportunities. How can I assist you with specific case reviews, expense logging, or report generation today?`;
  }
};
