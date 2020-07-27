import {ToyReact, Component} from './ToyReact/ToyReact'

class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>{true}</span>
        col<div>{this.children}</div>
      </div>
    )
  }
}

const a = (
  <MyComponent name='ayou'>
    <span>123</span>
  </MyComponent>
)

ToyReact.render(a, document.body)
