fx_version 'cerulean'
games { 'gta5' }
author 'https://github.com/MOXHARTZ'
repository 'https://github.com/MOXHARTZ/mx-audioplayer'
version '1.1.1'
lua54 'yes'

client_scripts {
    'client/*.lua'
}
server_scripts {
    'server/*.lua'
}

ui_page 'ui/build/index.html'

files({
    'ui/build/index.html',
    'ui/build/**/*',
})

dependencies {
    'mx-surround'
}
