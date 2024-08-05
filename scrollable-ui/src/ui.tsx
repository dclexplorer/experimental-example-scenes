import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { UiScrollResult, UiTransform, engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { Button, Input } from '@dcl/sdk/react-ecs'
import { type Vector2 } from '~system/EngineApi'

export class UiExample {
  // autoincrement counter, only for demonstration purposes
  private counter: number = 0
  // target for scroll position
  private target: string | Vector2 = { x: 0.5, y: 0.5 }
  // text to display in the scroll controller
  private scrollText = 'indeterminated'
  // id of the scroll container, to identify it in the controller
  private readonly scrollContainerId = 'my-scroll-container-A'

  constructor() {
  	engine.addSystem(this.controllerSystem.bind(this))
  }

  controllerSystem(): void {
  	for (const [, pos, uiTransform] of engine.getEntitiesWith(
  		UiScrollResult,
  		UiTransform
  	)) {
  		if (uiTransform.elementId !== this.scrollContainerId) {
  			continue
  		}

  		if (pos.value === undefined) {
  			break
  		}

  		if (pos.value.y <= 0) {
  			this.scrollText = 'top'
  		} else if (pos.value.y >= 1) {
  			this.scrollText = 'bottom'
  		} else if (pos.value.y < 0.5) {
  			this.scrollText = 'near top'
  		} else {
  			this.scrollText = 'near bottom'
  		}

  		if (pos.value.x <= 0) {
  			this.scrollText += ' left'
  		} else if (pos.value.x >= 1) {
  			this.scrollText += ' right'
  		} else {
  			this.scrollText += ' middle'
  		}
  	}

  	this.counter++
  }

  // This UI is only for demonstration purposes, not the focus of this example
  ScrollController(): ReactEcs.JSX.Element {
  	return (
  		<UiEntity
  			uiTransform={{
  				flexDirection: 'column',
  				position: { left: '25%', top: '10%' },
  				width: '200',
  				height: '300',
  				justifyContent: 'space-evenly',
  				alignItems: 'center'
  			}}
  			uiBackground={{ color: Color4.create(0.0, 0.0, 0.0, 1.0) }}
  		>
  			<Label value="Scroll controller" color={Color4.Green()} fontSize={14} />
  			<Button
  				fontSize={16}
  				uiTransform={{ width: '80%' }}
  				value="Focus first item"
  				onMouseDown={() => {
  					this.target = 'first'
  				}}
  			/>
  			<Button
  				fontSize={16}
  				uiTransform={{ width: '80%' }}
  				value="Focus second item"
  				onMouseDown={() => {
  					this.target = 'second'
  				}}
  			/>
  			<Label
  				fontSize={16}
  				value={`Currently:\n${this.scrollText}`}
  				color={Color4.White()}
  			/>

  			<Input
  				fontSize={16}
  				uiTransform={{ width: '90%' }}
  				placeholder="type target"
  				onChange={(value) => {
  					console.log(`change ${value}`)
  					this.target = value
  				}}
  				onSubmit={(value) => {
  					console.log(`submit ${value}`)
  					this.target = value
  				}}
  			/>
  		</UiEntity>
  	)
  }

  Scrolly(): ReactEcs.JSX.Element {
  	return (
  		<UiEntity
  			uiTransform={{
  				flexDirection: 'column',
  				alignItems: 'center',
  				justifyContent: 'space-between',
  				positionType: 'absolute',
  				width: '400',
  				height: '600',
  				position: { right: '8%', bottom: '3%' },

  				// new properties
  				overflow: 'scroll', // enable scrolling
  				scrollPosition: this.target, // if you want to set the scroll position programatically (maybe an action from the user)
  				elementId: this.scrollContainerId // id to identify the scroll result if you need to
  			}}
  			uiBackground={{
  				color: Color4.White()
  			}}
  		>
  			<Label
  				uiTransform={{
  					height: 'auto',
  					width: 'auto',
  					margin: '200px',
  					padding: `10px`,
  					// new property: we set the id, it must be unique, and we will use it to identify the scroll position
  					elementId: 'first'
  				}}
  				value={`first (${this.counter})`}
  				color={Color4.Black()}
  				fontSize={18}
  				textAlign="middle-center"
  				key="first"
  			/>
  			<Label
  				uiTransform={{
  					height: 'auto',
  					width: 'auto',
  					margin: '200px',
  					padding: `10px`,
  					// new property: we set the id, it must be unique, and we will use it to identify the scroll position
  					elementId: 'second'
  				}}
  				value="second"
  				color={Color4.Black()}
  				fontSize={18}
  				textAlign="middle-center"
  			/>
  			<Label
  				uiTransform={{
  					height: 'auto',
  					width: 'auto',
  					margin: '200px',
  					padding: `10px`,
  					// new property: we set the id, it must be unique, and we will use it to identify the scroll position
  					elementId: 'third'
  				}}
  				value="third"
  				color={Color4.Black()}
  				fontSize={18}
  				textAlign="middle-center"
  			/>
  			<Label
  				uiTransform={{
  					height: 'auto',
  					width: 'auto',
  					margin: '200px',
  					padding: `10px`,
  					// new property: we set the id, it must be unique, and we will use it to identify the scroll position
  					elementId: 'fourth'
  				}}
  				value="fourth"
  				color={Color4.Black()}
  				fontSize={18}
  				textAlign="middle-center"
  			/>
  			<Label
  				uiTransform={{
  					height: 'auto',
  					width: 'auto',
  					margin: '200px',
  					padding: `10px`,
  					// new property: we set the id, it must be unique, and we will use it to identify the scroll position
  					elementId: 'fifth'
  				}}
  				value="fifth"
  				color={Color4.Black()}
  				fontSize={18}
  				textAlign="middle-center"
  			/>
  		</UiEntity>
  	)
  }

  render(): ReactEcs.JSX.Element[] {
  	return [this.Scrolly(), this.ScrollController()]
  }
}
