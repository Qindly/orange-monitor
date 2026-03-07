function App() {
  const handleClick = () => {
    throw new Error('这是一个测试报错');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>playground-react</h1>
      <button onClick={handleClick}>点击触发报错</button>
    </div>
  );
}

export default App;
