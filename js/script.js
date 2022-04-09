// Work in progress

const RaiderIoApiUri = "https://raider.io/api/v1/guilds/profile?fields=raid_progression&region={0}&realm={1}&name={2}";
const progressWidgetUri = "https://raider.io/widgets/boss-progress?raid={0}&region={1}&realm={2}&guild={3}&boss=latest&period=until_kill&hide=&chromargb=transparent&difficulty={4}";
const progressGraphWidgetUri = "https://raider.io/widgets/health-over-attempt?raid={0}&type=attempt&period=until_kill&boss=latest&difficulty={1}&guilds={2}/{3}/{4}";

const guildWowArmoryUri = "https://worldofwarcraft.com/fr-fr/guild/{0}/{1}/{2}"; // realm & guild name as kebab case
const guildWarcraftLogsUri = "https://www.warcraftlogs.com/guild/{0}/{1}/{2}"; // realm as kebab case
const guildRaiderIoUri = "https://raider.io/guilds/{0}/{1}/{2}";

function isEmpty(str) {
    return (!str || str.length === 0);
}

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

const kebabCase = (string) => {
    return string.replace(/\d+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('-');
};

function capitalize(sentence) {
    return sentence && sentence[0].toUpperCase() + sentence.slice(1);
}

fetch("./config.json")
    .then(response => {
        return response.json();
    })
    .then(dataFile => {
        const raidTier = dataFile.raidTier;
        const oldRaidTier = dataFile.oldRaidTier;

        let headTitle = "Guild " + guildName + " (" + region.toUpperCase() + "-" + realm + ") World of Warcraft";
        $("meta[property='og:title']").attr("content", headTitle);
        $("meta[name='title']").attr("content", headTitle);
        $(document).prop('title', headTitle);

        let bodyTitle = "Guilde &#60;" + guildName + "&#62; <br />" + region.toUpperCase() + " " + realm + " - World of Warcraft";
        $("#bodyTitle").append("<h1>" + bodyTitle + "<h1/>");

        $('#guildLinksWowArmory').attr('href', String.format(guildWowArmoryUri, region, kebabCase(realm), kebabCase(guildName)));
        $('#guildLinksWarcraftLogs').attr('href', String.format(guildWarcraftLogsUri, region, kebabCase(realm), guildName));
        $('#guildLinksRaiderIo').attr('href', String.format(guildRaiderIoUri, region, realm, guildName));

        $('#oldProgressTitle').html("Old progress<br />");
        $(document).ready(function () {
            $.ajax({
                url: String.format(RaiderIoApiUri, region, realm, guildName),
                type: "GET",
                success: function (result) {
                    if (result.raid_progression[raidTier] == null) {
                        $('#progressWidgetMode').html("Progress not started<br />" + capitalize(raidTier.replaceAll('-', ' ')) + "<br />");
                        $("#progressGraphWidgetDiv").append("Nothing to display here for now");
                    }
                    else {
                        if (result.raid_progression[raidTier].mythic_bosses_killed > 0) {
                            let progressWidgetPath = String.format(progressWidgetUri, raidTier, region, realm, guildName, "mythic");
                            $('#progressWidgetMode').html("Progress " + result.raid_progression[raidTier].summary + "<br />" + capitalize(raidTier.replaceAll('-', ' ')) + "<br />");
                            $('#progressWidget').attr('src', progressWidgetPath);
                            let progressGraphWidgetPath = String.format(progressGraphWidgetUri, raidTier, "mythic", region, realm, guildName,);
                            $('#progressGraphWidget').attr('src', progressGraphWidgetPath);
                        }
                        else if (result.raid_progression[raidTier].heroic_bosses_killed > 0) {
                            let progressWidgetPath = String.format(progressWidgetUri, raidTier, region, realm, guildName, "heroic");
                            $('#progressWidgetMode').html("Progress " + result.raid_progression[raidTier].summary + "<br />" + capitalize(raidTier.replaceAll('-', ' ')) + "<br />");
                            $('#progressWidget').attr('src', progressWidgetPath);
                            let progressGraphWidgetPath = String.format(progressGraphWidgetUri, raidTier, "heroic", region, realm, guildName,);
                            $('#progressGraphWidget').attr('src', progressGraphWidgetPath);
                        } else {
                            let progressWidgetPath = String.format(progressWidgetUri, raidTier, region, realm, guildName, "normal");
                            $('#progressWidgetMode').html("Progress " + result.raid_progression[raidTier].summary + "<br />" + capitalize(raidTier.replaceAll('-', ' ')) + "<br />");
                            $('#progressWidget').attr('src', progressWidgetPath);
                            let progressGraphWidgetPath = String.format(progressGraphWidgetUri, raidTier, "normal", region, realm, guildName,);
                            $('#progressGraphWidget').attr('src', progressGraphWidgetPath);
                        }
                    }

                    oldRaidTier.forEach(t => {
                        if (result.raid_progression[t] == null) {
                            $("#oldProgressContent").append("<br /><h2>" + capitalize(t.replaceAll('-', ' ')) + "<h2/><br />Nothing to display for this raid");
                        }
                        else {
                            var text = "<br /><h2>" + capitalize(t.replaceAll('-', ' ')) + " " + result.raid_progression[t].summary + "<h2/>";
                            $("#oldProgressContent").append(text);

                            if (result.raid_progression[t].mythic_bosses_killed > 0) {
                                let progressWidgetPath = String.format(progressWidgetUri, t, region, realm, guildName, "mythic");
                                $('#oldProgressContent').append("<iframe src=\"" + progressWidgetPath + "\" width=\"380\" height=\"135\" allowtransparency=\"true\" frameBorder=\"0\"></iframe>");
                            }
                            else if (result.raid_progression[t].heroic_bosses_killed > 0) {
                                let progressWidgetPath = String.format(progressWidgetUri, t, region, realm, guildName, "heroic");
                                $('#oldProgressContent').append("<iframe src=\"" + progressWidgetPath + "\" width=\"380\" height=\"135\" allowtransparency=\"true\" frameBorder=\"0\"></iframe>");
                            } else {
                                let progressWidgetPath = String.format(progressWidgetUri, t, region, realm, guildName, "normal");
                                $('#oldProgressContent').append("<iframe src=\"" + progressWidgetPath + "\" width=\"380\" height=\"135\" allowtransparency=\"true\" frameBorder=\"0\"></iframe>");
                            }
                        }
                    });
                },
                error: function (error) {
                    console.log(error);
                    $("#progressGraphWidgetDiv").append("<span style=\"color:red\">Error</span>");
                    $("#oldProgressDiv").append("<span style=\"color:red\">Error</span>");
                }
            });
        });
    });

document.getElementById("year").innerHTML = new Date().getFullYear();
