type ProjectCardProps = {
  title: string;
  description: string;
};

const ProjectCard = ({ title, description }: ProjectCardProps) => {
  return (
    <div className="border rounded-lg p-5 shadow-sm hover:shadow-lg transition">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="text-gray-600 mt-2">
        {description}
      </p>
    </div>
  );
};

export default ProjectCard;