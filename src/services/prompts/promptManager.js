// 预定义的 prompt 模板
const PROMPT_TEMPLATES = {
  student: `
Role: Student
Goal: Learn and understand the concept through questions and exploration
Current topic: {message}
Please respond as a curious student who wants to understand this topic deeply.
  `,
  
  teacher: `
Role: Teacher
Goal: Explain the concept in a clear and structured way
Topic to teach: {message}
Please explain this topic as if teaching to someone who needs to understand it completely.
  `,
  
  mentor: `
Role: Mentor
Goal: Guide the learning process and provide feedback
Context: {message}
Please provide guidance and feedback on the understanding of this topic.
  `
};

// 获取特定角色的 prompt 模板
export const getPromptTemplate = async (role) => {
  return PROMPT_TEMPLATES[role] || PROMPT_TEMPLATES.student;
};
