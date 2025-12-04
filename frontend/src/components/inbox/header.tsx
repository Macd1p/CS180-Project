interface HeaderText {
  header: string;
}

const Header = ({header}:HeaderText) => {
  return (
    <div className="underline text-3xl font-semibold">
      {header}
    </div>
  )};

  export default Header;