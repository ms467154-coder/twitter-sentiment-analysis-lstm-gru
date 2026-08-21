export type FeatureCard = {
  icon: React.ElementType;
  title: string;
  description: string;
};

export type MetricCard = {
  label: string;
  value: string;
  tone: 'accuracy' | 'loss';
};
