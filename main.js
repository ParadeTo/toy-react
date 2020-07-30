import {ToyReact, Component} from './ToyReact/ToyReact'

class Board extends Component {
  constructor(props) {
    super(props)
    this.state = {
      squares: Array(9).fill(null),
    }
  }

  renderSquare(i) {
    console.log(this.state)
    debugger
    return <Square value={this.state.squares[i]} />
  }

  render() {
    const status = 'Next player: X'

    return (
      <div>
        <div className='status'>{status}</div>
        <div className='board-row'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='board-row'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='board-row'>
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    )
  }
}

class Square extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }
  render() {
    return (
      <button className='square' onClick={() => this.setState({value: 'X'})}>
        {this.state.value ? this.state.value : ''}
      </button>
    )
  }
}

const a = <Board></Board>

ToyReact.render(a, document.body)
