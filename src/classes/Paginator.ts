import { InteractionCollector } from 'oceanic-collectors';
import * as Lib from 'oceanic.js';
import Builders from './Builders';
import BotClient from './Client';

export default class Paginator {
	client: BotClient;
	pages: Array<Lib.InteractionContent>;
	currentPage: number;
	actionRow: (state: boolean) => Lib.MessageActionRow[];
	constructor(client: BotClient, pages: Array<Lib.InteractionContent>) {
		this.client = client;
		this.pages = pages;
		this.currentPage = 0;

		this.actionRow = (state: boolean) => {
			return new Builders.ActionRow()
				.addInteractionButton({
					label: '<<',
					customID: 'gotofirst',
					style: Lib.ButtonStyles.PRIMARY,
					disabled: state,
				})
				.addInteractionButton({
					label: '<',
					customID: 'goback',
					style: Lib.ButtonStyles.PRIMARY,
					disabled: state,
				})
				.addInteractionButton({
					label: '>',
					customID: 'gonext',
					style: Lib.ButtonStyles.PRIMARY,
					disabled: state,
				})
				.addInteractionButton({
					label: '>>',
					customID: 'gotolast',
					style: Lib.ButtonStyles.PRIMARY,
					disabled: state,
				})
				.toJSON();
		};
	}

	async start(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>, time: number) {
		interaction.createMessage({
			...this.getPage(0),
		});

		const collector = new InteractionCollector<
			Lib.InteractionTypes.MESSAGE_COMPONENT,
			Lib.ComponentTypes.BUTTON
		>(this.client, {
			interaction: interaction,
			filter: (i) => i.user.id === interaction.user.id,
			time: time,
		});

		collector.on('collect', (i) => this.onClicked(i));
		collector.on('end', () => this.onEnd(interaction));
	}

	async onClicked(interaction: Lib.ComponentInteraction<Lib.ComponentTypes.BUTTON>) {
		if (interaction.data.customID === 'gotofirst') {
			if (this.currentPage === 0) {
				return interaction.acknowledged
					? interaction.createFollowup({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the first page!").toJSON()],
							flags: 64,
					  })
					: interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the first page!").toJSON()],
							flags: 64,
					  });
			}
			await interaction.editParent(this.getPage(0));
		} else if (interaction.data.customID === 'goback') {
			if (this.currentPage === 0) {
				return interaction.acknowledged
					? interaction.createFollowup({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the first page!").toJSON()],
							flags: 64,
					  })
					: interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the first page!").toJSON()],
							flags: 64,
					  });
			}
			await interaction.editParent(this.getPage(this.currentPage - 1));
		} else if (interaction.data.customID === 'gonext') {
			if (this.currentPage === this.pages.length - 1) {
				return interaction.acknowledged
					? interaction.createFollowup({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the last page!").toJSON()],
							flags: 64,
					  })
					: interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the last page!").toJSON()],
							flags: 64,
					  });
			}
			await interaction.editParent(this.getPage(this.currentPage + 1));
		} else if (interaction.data.customID === 'gotolast') {
			if (this.currentPage === this.pages.length - 1) {
				return interaction.acknowledged
					? interaction.createFollowup({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the last page!").toJSON()],
							flags: 64,
					  })
					: interaction.createMessage({
							embeds: [Builders.ErrorEmbed().setDescription("you're already on the last page!").toJSON()],
							flags: 64,
					  });
			}
			await interaction.editParent(this.getPage(this.pages.length - 1));
		}
	}

	async onEnd(interaction: Lib.CommandInteraction<Lib.AnyGuildTextChannel>) {
		await interaction.editOriginal({ components: this.actionRow(true) });
	}

	getPage(number: number) {
		this.currentPage = number;
		return { ...this.pages[number], components: this.actionRow(false) };
	}
}
