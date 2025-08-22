export default function BackButton(props) {
  function handleBackButtonClick() {
    props.onBackButtonClick();
  }
  return (
    <button className="btn btn-secondary mb-3" onClick={handleBackButtonClick}>
      &larr; Back to Home
    </button>
  );
}
