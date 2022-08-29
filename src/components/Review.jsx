function Review({ data }) {
  return (
    <li className="p-3 border border-neutral-500">
      <p className="text-xl font-medium">{`${data.first_name} ${data.last_name}`}</p>
      <p>{data.review}</p>
    </li>
  );
}

export default Review;
