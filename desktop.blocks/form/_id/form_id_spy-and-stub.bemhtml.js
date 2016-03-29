block('form').mod('id', 'spy-and-stub')(
	js()(true),
	mix()(function () {
		return {
			block: 'form',
			mods: { ajax: true }
		}
	}),
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
);
