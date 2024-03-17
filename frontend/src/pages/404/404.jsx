import image from "./image.svg";

export const NotFound = () => {
  return (
    <div className="error-page">
      <div className="item">
        <img src={image} />
        <div className="text">
          <h1 className="error-page-code">404</h1>
          Страница не найдена
        </div>
      </div>
    </div>
  );
};
