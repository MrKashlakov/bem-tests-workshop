block('form').mod('id', 'spy-and-stub')(
	js()(true),
	content()(function () {
		return [
			{
				block: 'input',
				name: 'test-input',
				mods: { size: 'm', theme: 'islands' }
			},
			this.ctx.content
		]
	})
)