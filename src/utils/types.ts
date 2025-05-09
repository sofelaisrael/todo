export type Todo = {
    id: number;
    title: string;
    completed: boolean;
    pinned?: boolean;
    dueDate?: string;
    createdAt?: string;
    index?: number;
}