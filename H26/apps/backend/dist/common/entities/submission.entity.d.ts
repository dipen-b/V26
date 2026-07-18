import { User } from './user.entity';
import { Task } from './task.entity';
export declare enum SubmissionType {
    CODE = "code",
    GITHUB_PR = "github_pr",
    DOCUMENTATION = "documentation",
    TEST_EVIDENCE = "test_evidence",
    AI_PROMPT = "ai_prompt",
    OTHER = "other"
}
export declare class Submission {
    id: string;
    type: SubmissionType;
    content?: string;
    url?: string;
    metadata?: Record<string, any>;
    submittedBy: User;
    task: Task;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=submission.entity.d.ts.map