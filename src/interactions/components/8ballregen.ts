import {
	ComponentInteraction,
	ComponentTypes,
	SelectMenuTypes,
	AnyGuildTextChannel,
	ButtonStyles,
} from 'oceanic.js';
import Builders from '../../classes/Builders';
import Component from '../../classes/Component';
import type { ParentData } from '../../types/options';
import { answers } from '../../../config.json';

export default class EightballRegenerate extends Component {
	override id = 'regen8ball';
	override execute(
		interaction: ComponentInteraction<ComponentTypes.BUTTON | SelectMenuTypes, AnyGuildTextChannel>,
		parentData: ParentData
	): void | Promise<void> {
		if (!interaction.acknowledged) {
			interaction.editParent({
				embeds: [
					new Builders.Embed()
						.setRandomColor()
						.setTitle('🎱 8ball')
						.setDescription(
							`**question:** ${parentData.addition}`,
							`**answer:** ${answers[Math.floor(Math.random() * answers.length)]}`
						)
						.setTimestamp()
						.toJSON(),
				],
				components: new Builders.ActionRow()
					.addInteractionButton({
						label: 'regenerate',
						style: ButtonStyles.PRIMARY,
						customID: [
							parentData.userID,
							parentData.interactionID,
							parentData.componentID,
							parentData.addition,
						].join('|'),
					})
					.toJSON(),
			});
		} else {
			interaction.editOriginal({
				embeds: [
					new Builders.Embed()
						.setRandomColor()
						.setTitle('🎱 8ball')
						.setDescription(
							`**question:** ${parentData.addition}`,
							`**answer:** ${answers[Math.floor(Math.random() * answers.length)]}`
						)
						.setTimestamp()
						.toJSON(),
				],
				components: new Builders.ActionRow()
					.addInteractionButton({
						label: 'regenerate',
						style: ButtonStyles.PRIMARY,
						customID: [
							parentData.userID,
							parentData.interactionID,
							parentData.componentID,
							parentData.addition,
						].join('|'),
					})
					.toJSON(),
			});
		}
	}
}
