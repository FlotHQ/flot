export type Template = {
    id: string;
    title: string;
    description: string;
    services: {
        name: string;
        icon: string;
    }[];
    categories: string[];
};


export type TemplateCategory = {
    id: string;
    label: string;
    order?: number;
};
