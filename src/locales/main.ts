import ms from 'ms';
import type { AnyGuildTextChannel, CommandInteraction, Member, Role, User } from 'oceanic.js';
import type Command from '../classes/Command';

export const errors = {
	invalidCommand: "The command that you used doesn't exist.",
	invalidBotPerms: [
		"I don't have enough permissions, Please give me following permission:",
		'',
		'**- View Channels**',
		'**- Manage Channels**',
		'**- Manage Roles**',
		'**- Manage Server**',
		'**- Create Invite**',
		'**- Change Nickname**',
		'**- Manage Nicknames**',
		'**- Kick Members**',
		'**- Ban Members**',
		'**- Moderate Members**',
		'**- Send Messages**',
		'**- Send Messages In Threads**',
		'**- Create Threads**',
		'**- Create Private Threads**',
		'**- Embed Links**',
		'**- Attach Files**',
		'**- Add Reactions**',
		'**- Use External Emoji**',
		'**- Use External Stickers**',
		'**- Manage Messages**',
		'**- Read Message History**',
		'**- Connect**',
		'**- Speak**',
		'**- Mute Members**',
		'**- Deafen Members**',
		'**- Move Members**',
	].join('\n'),
	notEnoughUserPerms: (cmd: Command) => `You need ${cmd.userPermission} permission to do that.`,
	noResult:
		'No result found, Maybe you should search it on \`https://www.urbandictionary.com\`, since the API sucks.',
	invalidChoice:
		"Your choice isn't valid.\n**This should never happen. If you're seeing this, either you or Discord messed up real bad.**",
	invalidUser:
		"User ID that you provided isn't valid.\n**This should never happen. If you're seeing this, either you or Discord messed up real bad.**",
	banActionOnSelf: 'Nooo! :(',
	banActionOnBot: "Hey! This isn't funny!",
	banActionOnOwner: "There's no way to ban the owner. If you can't, I can't.",
	banActionOnAdmin: "You can't ban the admins.",
	banActionOnHigherRoleUser: "You can't ban the people that have the same or higher role than you.",
	banActionOnHigherRoleBot: "I can't ban the people that have the same or higher role than me.",
	invalidTime:
		"Time that you provided isn't valid, Please specify them correctly (Example: 5h, 10 minutes etc.)",
	timeExceedOrBelowLimitBan: 'The time should not exceed 1 week and must be above 1 second.',
	cannotBan: (error: unknown) =>
		`I can't ban the user? What the hell??? Report error below to developers:\n\n${error}`,
	userNotInGuild: "The user that provided isn't in this server.",
	softBanActionOnSelf: 'Nooo! :(',
	softBanActionOnBot: "Hey! This isn't funny!",
	softBanActionOnOwner: "There's no way to softban the owner. If you can't, I can't.",
	softBanActionOnAdmin: "You can't softban the admins.",
	softBanActionOnHigherRoleUser: "You can't softban the people that have the same or higher role than you.",
	softBanActionOnHigherRoleBot: "I can't softban the people that have the same or higher role than me.",
	timeExceedOrBelowLimitSoftban: 'The time should not exceed 1 week and must be above 1 second.',
	cannotSoftBan: (error: unknown) =>
		`I can't softban the user? What the hell??? Report error below to developers:\n\n${error}`,
	notBanned: "The user that you provided isn't banned!",
	cannotUnban: (error: unknown) =>
		`I can't unban the user? What the hell??? Report error below to developers:\n\n${error}`,
	kickActionOnSelf: 'Nooo! :(',
	kickActionOnBot: "Hey! This isn't funny!",
	kickActionOnOwner: "There's no way to kick the owner. If you can't, I can't.",
	kickActionOnAdmin: "You can't kick the admins.",
	kickActionOnHigherRoleUser: "You can't kick the people that have the same or higher role than you.",
	kickActionOnHigherRoleBot: "I can't kick the people that have the same or higher role than me.",
	cannotKick: (error: unknown) =>
		`I can't kick the user? What the hell??? Report error below to developers:\n\n${error}`,
	changeNickActionOnOwner: "There's no way to change the owner nickname. If you can't, I can't.",
	changeNickActionOnAdmin: "You can't change admin nickname.",
	changeNickActionOnHigherRoleUser:
		"You can't change nickname of people that have the same or higher role than you.",
	changeNickActionOnHigherRoleBot:
		"I can't change nickname of people that have the same or higher role than me.",
	cannotChangeNick: (error: unknown) =>
		`I can't change the user nickname? What the hell??? Report error below to developers:\n\n${error}`,
	removeNickActionOnOwner: "There's no way to remove the owner nickname. If you can't, I can't.",
	removeNickActionOnAdmin: "You can't remove admin nickname.",
	removeNickActionOnHigherRoleUser:
		"You can't remove nickname of people that have the same or higher role than you.",
	removeNickActionOnHigherRoleBot:
		"I can't remove nickname of people that have the same or higher role than me.",
	cannotRemoveNick: (error: unknown) =>
		`I can't remove the user nickname? What the hell??? Report error below to developers:\n\n${error}`,
	cannotPurge: (error: unknown) =>
		`I can't purge the messages? What the hell??? Report error below to developers:\n\n${error}`,
	addRoleActionOnOwner: "There's no way to give the owner roles. If you can't, I can't.",
	addRoleActionOnAdmin: "You can't give admin roles.",
	addRoleActionOnHigherRoleUser: "You can't give role to people that have the same or higher role than you.",
	addRoleActionOnHigherRoleBot: "I can't give role to people that have the same or higher role than me.",
	addRoleActionWithHigherRoleUser: "You can't give people role that have the same or higher role than you.",
	addRoleActionWithHigherRoleBot: "I can't give people role that have the same or higher role than me.",
	cannotAddRole: (error: unknown) =>
		`I can't give role to the user? What the hell??? Report error below to developers:\n\n${error}`,
	removeRoleActionOnOwner: "There's no way to remove the owner roles. If you can't, I can't.",
	removeRoleActionOnAdmin: "You can't remove admin roles.",
	removeRoleActionOnHigherRoleUser:
		"You can't remove role from people that have the same or higher role than you.",
	removeRoleActionOnHigherRoleBot:
		"I can't remove role from people that have the same or higher role than me.",
	removeRoleActionWithHigherRoleUser:
		"You can't remove people role that have the same or higher role than you.",
	removeRoleActionWithHigherRoleBot: "I can't remove people role that have the same or higher role than me.",
	cannotRemoveRole: (error: unknown) =>
		`I can't remove role from the user? What the hell??? Report error below to developers:\n\n${error}`,
	notTextableChannel: "The channel that you provided isn't a textable channel.",
	timeExceedOrBelowLimitSlowmode: 'The time should not exceed 6 hours and must be above 1 second.',
	cannotChangeSlowmode: (error: unknown) =>
		`I can't change slowmode? What the hell??? Report error below to developers:\n\n${error}`,
	cannotRemoveSlowmode: (error: unknown) =>
		`I can't remove slowmode? What the hell??? Report error below to developers:\n\n${error}`,
	timeoutActionOnSelf: 'Nooo! :(',
	timeoutActionOnBot: "Hey! This isn't funny!",
	timeoutActionOnOwner: "There's no way to timeout the owner. If you can't, I can't.",
	timeoutActionOnAdmin: "You can't timeout the admins.",
	timeoutActionOnHigherRoleUser: "You can't timeout the people that have the same or higher role than you.",
	timeoutActionOnHigherRoleBot: "I can't timeout the people that have the same or higher role than me.",
	timeExceedOrBelowLimitTimeout: 'The time should not exceed 1 week and must be above 1 second.',
	cannotTimeout: (error: unknown) =>
		`I can't timeout the user? What the hell??? Report error below to developers:\n\n${error}`,
	untimeoutActionOnSelf: `That's cheating!`,
	untimeoutActionOnBot: 'Thanks?',
	untimeoutActionOnOwner: "There's no way to untimeout the owner because you can't even timeout the owner.",
	untimeoutActionOnAdmin: "You can't untimeout the admins.",
	untimeoutActionOnHigherRoleUser:
		"You can't untimeout the people that have the same or higher role than you.",
	untimeoutActionOnHigherRoleBot: "I can't untimeout the people that have the same or higher role than me.",
	cannotUntimeout: (error: unknown) =>
		`I can't untimeout the user? What the hell??? Report error below to developers:\n\n${error}`,
	notGuildChannel: "The channel that you provided isn't a guild channel.",
	viewActionOnHigherRoleUser: "You can't view role that have the same or higher role than you.",
	invalidSubcommand: "The subcommand that you used doesn't exist.",
	onFirstPage: "You're already on the first page.",
	onLastPage: "You're already on the last page.",
};

export const dm = {
	ban: (interaction: CommandInteraction<AnyGuildTextChannel>, reason: string) =>
		`You got banned on ${interaction.guild.name} for ${reason} by ${interaction.user.tag}.`,
	softban: (interaction: CommandInteraction<AnyGuildTextChannel>, reason: string) =>
		`You got softbanned on ${interaction.guild.name} for ${reason} by ${interaction.user.tag}.`,
	kick: (interaction: CommandInteraction<AnyGuildTextChannel>, reason: string) =>
		`You got kicked on ${interaction.guild.name} for ${reason} by ${interaction.user.tag}.`,
	timeout: (interaction: CommandInteraction<AnyGuildTextChannel>, reason: string) =>
		`You got timeout on ${interaction.guild.name} for ${reason} by ${interaction.user.tag}.`,
};

export const success = {
	ban: (user: User | Member, dmSuccess: boolean) => {
		if (dmSuccess) return `Successfully banned ${user.tag}.`;
		else return `Successfully banned ${user.tag}. But I can't dm them.`;
	},
	softban: (user: User | Member, dmSuccess: boolean) => {
		if (dmSuccess) return `Successfully softbanned ${user.tag}.`;
		else return `Successfully softbanned ${user.tag}. But I can't dm them.`;
	},
	unban: (user: User | Member) => `Successfully unbanned ${user.tag}.`,
	kick: (user: User | Member, dmSuccess: boolean) => {
		if (dmSuccess) return `Successfully kicked ${user.tag}.`;
		else return `Successfully kicked ${user.tag}. But I can't dm them.`;
	},
	timeout: (user: User | Member, dmSuccess: boolean) => {
		if (dmSuccess) return `Successfully timeout ${user.tag}.`;
		else return `Successfully timeout ${user.tag}. But I can't dm them.`;
	},
	untimeout: (user: User | Member) => `Successfully untimeout ${user.tag}.`,
	changeNick: (user: User | Member) => `Successfully changed ${user.tag}'s nickname.`,
	removeNick: (user: User | Member) => `Successfully removed ${user.tag}'s nickname.`,
	purge: (amount: number) => `Successfully purged ${amount} messages.`,
	purgeWithUser: (user: User | Member, amount: number) =>
		`Successfully purged ${amount} messages from ${user.tag}`,
	addRole: (user: User | Member, role: Role) => `Successfully added ${role.name} to ${user.tag}.`,
	removeRole: (user: User | Member, role: Role) => `Successfully removed ${role.name} from ${user.tag}.`,
	changeSlowmode: (channel: AnyGuildTextChannel, time: number) =>
		`Successfully changed ${channel.name} slowmode to ${ms(time, { long: true })}.`,
	removeSlowmode: (channel: AnyGuildTextChannel) => `Successfully removed ${channel.name} slowmode.`,
};

export const others = {
	defaultReason: 'No reason??',
};
