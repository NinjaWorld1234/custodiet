export interface ProjectInfo {
    name: string;
    version: string;
    last_update: string;
}

export type ReliabilityTier = 'A' | 'B';
export type SourceCategory = 'natural' | 'cyber' | 'geopolitics' | 'humanitarian' | 'environment' | 'infrastructure';
export type DataFormat = 'geojson' | 'json' | 'xml_or_json';

export interface DataSource {
    source_id: string;
    title: string;
    category: SourceCategory;
    subcategory: string;
    reliability_tier: ReliabilityTier;
    endpoint: string;
    data_format: DataFormat;
    update_frequency: string;
    auth_required?: boolean;
}

export interface SourcesConfig {
    project_info: ProjectInfo;
    selected_sources: DataSource[];
}
