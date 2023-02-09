const User = require('../models/User');
const Configuration = require('../models/Configuration');
const Band = require('../models/Band');
const Project = require('../models/Project');
const Image = require('../models/Image');
const Category = require('../models/Category');
const Portofolio = require('../models/Portofolio');
const Journal = require('../models/Journal');

const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = {
    viewLogin : async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            const user = await User.find();
            if(user.length == 0) {
                res.redirect('/admin/first-started')
            } else {
                if(req.session.user === null || req.session.user === undefined){
                    res.render('index', {
                        title: "Badilz | Login" ,
                        alert,
                    });
                } else {
                    res.redirect('/admin/dashboard');
                }
            }
            
        } catch (error) {
            res.redirect('/admin/signin')
        }
    },
    
    actionLogin : async (req, res) => {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username : username});
            if(!user){
                req.flash('alertMessage', 'Username not found!');
                req.flash('alertStatus', 'danger')
                res.redirect('/admin/signin');
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if(!isPasswordMatch){
                req.flash('alertMessage', 'Password not match!');
                req.flash('alertStatus', 'danger')
                res.redirect('/admin/signin');
            }

            req.session.user = {
                id: user.id,
                username: user.username
            }

            res.redirect('/admin/dashboard');
        } catch (error) {
            res.redirect('/admin/signin');
        }
    },

    actionLogout : (req, res) => {
        req.session.destroy();
        res.redirect('/admin/signin');
    },

    firstStarted : async (req, res) => {
        const user = await User.find();
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        if(req.session.user === null || req.session.user === undefined){
            if(user.length == 0) {
                res.render('admin/first/view_started', {
                    title: "Badilz | First" ,
                    alert,
                });
            } else {
                res.redirect('/admin/singin');
            }
        } else {
            res.redirect('/admin/dashboard');
        }
    },

    createFirst : async (req, res) => {
        try {
             const {username, password, auth} = req.body;
             const dbUsername = await User.findOne({ username : username });
             if(username.length < 4) {
                 req.flash('alertMessage', 'Make sure the username more than three characters');
                 req.flash('alertStatus', 'danger');
                 res.redirect('/admin/add-user');
             }
 
             if(auth == "badilzproject") {
                if(dbUsername === null) {
                    await User.create({
                        username,
                        password
                    });
                    req.flash('alertMessage', 'Success Add');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/singin');
                } else {
                    req.flash('alertMessage', 'Username already taken');
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/first-started');
                }
             } else {
                req.flash('alertMessage', 'WARNING : restricted, permission needed');
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/first-started');
             }
             
        } catch (error) {
             req.flash('alertMessage', `${error.message}`);
             req.flash('alertStatus', 'danger')
             res.redirect('/admin/first-started');
        }
     },
    
    viewDashboard : async (req, res) => {
        try {
            const band = await Band.find();
            const user = await User.find().select('username');
            const project = await Project.find();
            const portofolio = await Portofolio.find();
            const category = await Category.find();
            const journal = await Journal.find();
            res.render('admin/dashboard/view_dashboard', {
                band: band.length,
                admin: user.length,
                project: project.length,
                category: category.length,
                journal: journal.length,
                porto : portofolio.length,
                title: "Badilz | Dashboard",
                user: req.session.user
            });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    },

    viewAdminlist : async (req, res) => {
        const list = await User.find().select('username');
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/userlist/view_user', {
            alert,
            list,
            title: "Badilz | User List",
            user: req.session.user,
            action: 'view',
        });
    },

    addPageAdminlist : async (req, res) => {
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/userlist/view_user', {
            alert,
            title: "Badilz | Add User",
            user: req.session.user,
            action: 'add',
        });
    },
    
    createAcccount : async (req, res) => {
       try {
            const {username, password} = req.body;
            const dbUsername = await User.findOne({ username : username });
            if(username.length < 4) {
                req.flash('alertMessage', 'Make sure the username more than three characters');
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/add-user');
            }

            if(dbUsername === null) {
                await User.create({
                    username,
                    password
                });
                req.flash('alertMessage', 'Success Add');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/userlist');
            } else {
                req.flash('alertMessage', 'Username already taken');
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/add-user');
            }
       } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/userlist');
       }
    },

    deleteUser : async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({_id : id});
            if(user._id.toString() === req.session.user.id) {
                req.flash('alertMessage', 'Cannot delete your username');
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/userlist');
            } else {
                await user.remove();
                req.flash('alertMessage', 'Deleted Success');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/userlist');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/userlist');
        }
    },

    viewConfiguration : async (req, res) => {
        try {
            const data = await Configuration.find();
            if(data == "") {
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/configuration/view_configuration', {
                    user: req.session.user,
                    title: "Badilz | Configuration" ,
                    alert,
                    action: 'add',
                });
            } else {
                const body = data[Object.keys(data)[0]];
                const id = body._id;
                const configuration = await Configuration.findOne({_id: id});
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/configuration/view_configuration', {
                    user: req.session.user,
                    title: "Badilz | Configuration" ,
                    alert,
                    action: 'update',
                    configuration,
                });
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/configuration');
        }
    },

    addConfiguration : async (req, res) => {
        try {
            const { 
                navbarName,
                heroTitleFirst, 
                heroTitleSecond,
                heroDescription,
                email,
                twitterLink,
                instagramLink,
                facebookLink,
                spotifyLink,
                embedSpotifyLink,
                aboutMeDescription,
                footerQuote,
                footerAuthor     
            } = req.body;

            await Configuration.create({ 
                navbarName,
                heroTitleFirst, 
                heroTitleSecond,
                heroDescription,
                email,
                twitterLink,
                instagramLink,
                facebookLink,
                spotifyLink,
                aboutMeDescription,
                embedSpotifyLink,
                footerQuote,
                footerAuthor 
            });
            req.flash('alertMessage', 'Success Add');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/configuration');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/configuration');
        }
    },

    editConfiguration : async(req,res) => {
        try {
            const { 
                id,
                navbarName,
                heroTitleFirst, 
                heroTitleSecond,
                heroDescription,
                email,
                twitterLink,
                instagramLink,
                facebookLink,
                spotifyLink,
                embedSpotifyLink,
                aboutMeDescription,
                footerQuote,
                footerAuthor     
            } = req.body;

            const configuration = await Configuration.findOne({_id : id});
            configuration.navbarName = navbarName;
            configuration.heroTitleFirst = heroTitleFirst;
            configuration.heroTitleSecond = heroTitleSecond;
            configuration.heroDescription = heroDescription;
            configuration.email = email;
            configuration.twitterLink = twitterLink;
            configuration.instagramLink = instagramLink;
            configuration.facebookLink = facebookLink;
            configuration.spotifyLink = spotifyLink;
            configuration.embedSpotifyLink = embedSpotifyLink;
            configuration.aboutMeDescription = aboutMeDescription;
            configuration.footerQuote = footerQuote;
            configuration.footerAuthor = footerAuthor;
            await configuration.save();
            req.flash('alertMessage', 'Success Update');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/configuration');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/configuration');
        }
    },

    viewBand : async (req, res) => {
        try {
            const band = await Band.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/band/view_band', {
                band,
                title: "Badilz | Band",
                alert,
                action: "view",
                user: req.session.user
            })
        } catch (error) {
            res.redirect('admin/band');
        }
    }, 

    addPageBand : (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/band/view_band', {
                title: "Badilz | Band",
                action: "add",
                user: req.session.user,
                alert
            })
        } catch (error) {
            res.redirect('admin/band');
        }
    }, 

    addBand : async (req,res) => {
        try {
            const {
                name,
                city,
                introduction,
                firstDescription,
                secondDescription,
                twitterLink,
                instagramLink,
                facebookLink,
                spotifyProfile,
                spotifyEmbed
            } = req.body;

            const coverUrl = `images/${req.files.image[0].filename}`;

            const newBand = {
                name,
                city,
                introduction,
                firstDescription,
                secondDescription,
                twitterLink,
                instagramLink,
                facebookLink,
                spotifyProfile,
                spotifyEmbed,
                coverUrl
            }  

            const band = await Band.create(newBand);
            
            if(req.files.images){
                
                for(let i = 0; i < req.files.images.length; i++){
                    const imageSave = await Image.create({imageUrl: `images/${req.files.images[i].filename}`});
                    band.imageId.push({_id: imageSave._id});
                    await band.save();
                }
                
            }

            req.flash('alertMessage', 'Success Added');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/band');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/band');
        }
    },

    editPageBand : async (req, res) => {
        try {
            const { id } = req.params;
            const band = await Band.findOne({_id : id})
                .populate({path: 'imageId', select: 'id imageUrl'});
            res.render('admin/band/view_band', {
                band,
                title: "Badilz | Band",
                action: "edit",
                user: req.session.user
            })
        } catch (error) {
            res.redirect('admin/band');
        }
    }, 

    editBand : async(req, res) => {
        try {
            const { id } = req.params;
            const {
                name,
                city,
                introduction,
                firstDescription,
                secondDescription,
                twitterLink,
                instagramLink,
                facebookLink,
                spotifyProfile,
                spotifyEmbed,
                imageStatus
            } = req.body;

            const band = await Band.findOne({_id: id})
                .populate({path: 'imageId', select: 'id imageUrl'});

            band.name = name;
            band.city = city;
            band.introduction = introduction;
            band.firstDescription = firstDescription;
            band.secondDescription = secondDescription;
            band.twitterLink = twitterLink;
            band.instagramLink = instagramLink;
            band.facebookLink = facebookLink;
            band.spotifyProfile = spotifyProfile;
            band.spotifyEmbed = spotifyEmbed;

            // Cover Image
            if(req.files.image) {
                await fs.unlink(path.join(`public/${band.coverUrl}`));
                band.coverUrl = `images/${req.files.image[0].filename}`;
            } 
            
            // Gallery Image
            switch (imageStatus) {
                case 'none':
                    
                    break;
            
                case 'add':
                    for(let i = 0; i < req.files.images.length; i++){
                        const imageSave = await Image.create({imageUrl: `images/${req.files.images[i].filename}`});
                        band.imageId.push({_id: imageSave._id});
                        await imageSave.save();
                    }
                    break;

                case 'create':
                    for(let i = 0; i < band.imageId.length; i++) {
                        const imageUpdate = await Image.findOne({_id: band.imageId[i]._id});    
                        await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
                        const oldImage = band.imageId[i]._id;
                        await imageUpdate.remove(); 
                        await Band.updateOne({}, {$pull: { imageId: oldImage }} );
                    }
                    for(let i = 0; i < req.files.images.length; i++){
                        const imageSave = await Image.create({imageUrl: `images/${req.files.images[i].filename}`});
                        band.imageId.push({_id: imageSave._id});
                        await imageSave.save();
                    }
                    break;

                case 'remove':
                    for(let i = 0; i < band.imageId.length; i++) {
                        const imageUpdate = await Image.findOne({_id: band.imageId[i]._id});    
                        await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
                        await Band.updateOne({}, {$pull: { imageId: band.imageId[i]._id }} );
                        await imageUpdate.remove(); 
                    }
                    break;
            }

            await band.save();
            req.flash('alertMessage', 'Success Update Band');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/band');

        } catch (error) {
            console.log(error.message);
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/band');
        }
    },

    deleteBand : async (req, res) => {
        try {
            const { id } = req.params;
            const band = await Band.findOne({_id: id}).populate('imageId');
            await fs.unlink(path.join(`public/${band.coverUrl}`));
            for(let i = 0; i < band.imageId.length; i++) {
                Image.findOne({_id: band.imageId[i]._id}).then((image) => {
                    fs.unlink(path.join(`public/${image.imageUrl}`));
                    image.remove();
                }).catch ((err) => {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/band');
                })
            }   
            await band.remove();
            req.flash('alertMessage', 'Success Delete Band');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/band');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/band');
        }
    },

    viewProject : async (req, res) => {
        try {
            const project = await Project.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/project/view_project', {
                project,
                title: "Badilz | Project",
                alert,
                action: "view",
                user: req.session.user
            })
        } catch (error) {
            
        }
    },

    addPageProject : async (req, res) => {
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/project/view_project', {
            title: "Badilz | Project",
            alert,
            action: "add",
            user: req.session.user
        })
    },

    addProject : async (req, res) => {
        try {
            const { name, year, description } = req.body;
            await Project.create({
                year,
                name,
                description,
                imageUrl: `images/${req.file.filename}`
            });

            req.flash('alertMessage', 'Success Add');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/project');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/project');
        }
    },

    editPageProject : async (req, res) => {
        const { id } = req.params;
        const project = await Project.findOne({ _id : id });
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/project/view_project', {
            title: "Badilz | Project",
            project,
            alert,
            action: "edit",
            user: req.session.user
        })
    },

    editProject : async (req, res) => {
        const { id, name, year, description } = req.body;
        const project = await Project.findOne({ _id : id });      
        try {
            if(req.file == undefined) {
                project.name = name;
                project.year = year;
                project.description = description;
                await project.save();
                req.flash('alertMessage', 'Success Update');
                req.flash('alertStatus', 'success');
                res.redirect(`/admin/project`);
            } else {
                await fs.unlink(path.join(`public/${project.imageUrl}`));
                project.name = name;
                project.year = year;
                project.description = description;
                project.imageUrl = `images/${req.file.filename}`;
                await project.save();
                req.flash('alertMessage', 'Success Update');
                req.flash('alertStatus', 'success');
                res.redirect(`/admin/project`);
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/project');
        }
    },

    deleteProject : async (req, res) => {
        try {
            const { id } = req.params;
            const project = await Project.findOne({_id : id});
            await fs.unlink(path.join(`public/${project.imageUrl}`));
            await project.remove();
            req.flash('alertMessage', 'Deleted Success');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/project');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/project');
        }
    },

    viewPortofolio : async (req, res) => {
        try {
            const video = await Portofolio.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/portofolio/view_portofolio', {
                title: "Badilz | Portofolio",
                alert,
                video,
                action: "view",
                user: req.session.user
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/portofolio');
        }
    }, 

    addPagePortofolio : async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/portofolio/view_portofolio', {
                title: "Badilz | Portofolio",
                alert,
                action: "add",
                user: req.session.user
            })
        } catch (error) {
            res.redirect('admin/portofolio');
        }
    },

    addPortofolio : async (req, res) => {
        try {
            const { name, year, youtubeLink } = req.body;
            await Portofolio.create({
                name,
                year, 
                youtubeLink
            });
            req.flash('alertMessage', 'Success Added');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/portofolio');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/portofolio');
        }
    },

    editPagePortofolio : async (req, res) => {
        try {
            const { id } = req.params;
            const video = await Portofolio.findOne({_id : id});
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/portofolio/view_portofolio', {
                title: "Badilz | Portofolio",
                video,
                alert,
                action: "edit",
                user: req.session.user
            })
        } catch (error) {
            res.redirect('admin/portofolio');
        };

    },

    editPortofolio : async (req, res) => {
        try {
            const { id } = req.params;
            const { name, year, youtubeLink } = req.body;
            const video = await Portofolio.findOne({_id : id});
            video.name = name;
            video.year = year;
            video.youtubeLink = youtubeLink;
            await video.save();
            req.flash('alertMessage', 'Success Updated');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/portofolio');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/portofolio');
        }
    },

    deletePortofolio : async (req, res) => {
        try {
            const { id } = req.params;
            const video = await Portofolio.findOne({_id : id});
            await video.remove();
            req.flash('alertMessage', 'Success Deleted');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/portofolio');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/portofolio');
        }
    },

    viewCategory : async (req, res) => {
        try {
            const category = await Category.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/category/view_category', { 
                category,
                alert,
                title: "Badilz | Category",
                user: req.session.user
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    }, 

    addCategory : async (req, res) => {
        try {
            const { name, description } = req.body;
            await Category.create({
                name, 
                description
            });
            req.flash('alertMessage', 'Success Added');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/category');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },

    editCategory : async (req,res) => {
        try {
            const { id, name, description } = req.body;
            const category = await Category.findOne({_id : id});
            category.name = name;
            category.description = description;
            await category.save();
            req.flash('alertMessage', 'Success Updated');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/category');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },

    deleteCategory : async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findOne({_id : id});
            const journal = await Journal.findOne({categoryId : id});
            if(journal) {
                req.flash('alertMessage', 'Category used by journal, please delete the journal first before this');
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/category');
            } else {
                await category.remove();
                req.flash('alertMessage', 'Success Deleted');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/category');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },


    viewJournal : async (req, res) => {
        try {
            const journal = await Journal.find()
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'});
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/journal/view_journal', {
                journal,
                alert,
                title: "Badilz | Journal",
                action: "view",
                user: req.session.user
            })
        } catch (error) {
            
        }
    }, 

    addPageJournal : async (req, res) => {
        const category = await Category.find();
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};
        res.render('admin/journal/view_journal', { 
            category,
            alert,
            title: "Badilz | Journal",
            action: "add",
            user: req.session.user
        })
    },

    addJournal : async (req, res) => {
        try {
            const {
                title,
                author,
                year,
                journalQuote,
                journalContentFirst, 
                journalContentSecond,
                categoryId
            } = req.body;

            const coverUrl = `images/${req.files.image[0].filename}`;

            const category = await Category.findOne({_id: categoryId});
            const newJournal = {
                title,
                author,
                year,
                journalQuote,
                journalContentFirst,
                journalContentSecond,
                categoryId: category._id,
                coverUrl
            };
            const journal = await Journal.create(newJournal);
            category.journalId.push({_id: journal._id});
            await category.save();  

            if(req.files.images){
                for(let i = 0; i < req.files.images.length; i++){
                    const imageSave = await Image.create({imageUrl: `images/${req.files.images[i].filename}`});
                    journal.imageId.push({_id: imageSave._id});
                    await journal.save();
                }               
            }

            req.flash('alertMessage', 'Success Add');
            req.flash('alertStatus', 'success');    
            res.redirect('/admin/journal');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/journal');
        }
    },

    editPageJournal : async (req, res) => {
        const { id } = req.params;
        const journal = await Journal.findOne({ _id : id })
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'});
        const category = await Category.find();
        const alertMessage = req.flash('alertMessage');
        const alertStatus = req.flash('alertStatus');
        const alert = {message: alertMessage, status: alertStatus};

        res.render('admin/journal/view_journal', { 
            category,
            journal,
            alert,
            title: "Badilz | Journal",
            action: "edit",
            user: req.session.user
        })
    },

    editJournal : async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                author,
                year,
                journalQuote,
                journalContentFirst,
                journalContentSecond,
                categoryId,
                imageStatus
            } = req.body;

            const journal = await Journal.findOne({ _id : id })
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'});
            const category = await Category.findOne({_id: categoryId});

            if(categoryId !== journal.categoryId) {
                await Category.updateMany({}, {$pull: { journalId: journal._id }});
                category.journalId.push({_id: journal._id});
                await category.save();
            };
            journal.title = title;
            journal.author = author;
            journal.year = year;
            journal.journalQuote = journalQuote;
            journal.journalContentFirst = journalContentFirst;
            journal.journalContentSecond = journalContentSecond;
            journal.categoryId = category._id;

            // Cover Image
            if(req.files.image) {
                await fs.unlink(path.join(`public/${journal.coverUrl}`));
                journal.coverUrl = `images/${req.files.image[0].filename}`;
            } 
            
            // Gallery Image
            switch (imageStatus) {
                case 'none':
                    
                    break;
            
                case 'add':
                    for(let i = 0; i < req.files.images.length; i++){
                        const imageSave = await Image.create({imageUrl: `images/${req.files.images[i].filename}`});
                        journal.imageId.push({_id: imageSave._id});
                        await imageSave.save();
                    }
                    break;

                case 'create':
                    for(let i = 0; i < journal.imageId.length; i++) {
                        const imageUpdate = await Image.findOne({_id: journal.imageId[i]._id});    
                        await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
                        const oldImage = journal.imageId[i]._id;
                        await imageUpdate.remove(); 
                        await Journal.updateOne({}, {$pull: { imageId: oldImage }} );
                    }
                    for(let i = 0; i < req.files.images.length; i++){
                        const imageSave = await Image.create({imageUrl: `images/${req.files.images[i].filename}`});
                        journal.imageId.push({_id: imageSave._id});
                        await imageSave.save();
                    }
                    break;

                case 'remove':
                    for(let i = 0; i < journal.imageId.length; i++) {
                        const imageUpdate = await Image.findOne({_id: journal.imageId[i]._id});  
                        const journalImageId = await Journal.findOne({ imageId : journal.imageId[i]._id})  
                        await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
                        await Journal.updateOne({}, {$pull: { imageId: journal.imageId[i]._id }} );
                        await imageUpdate.remove();
                    }
                    break;
            }

            await journal.save();
            req.flash('alertMessage', 'Success Update');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/journal');

        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/journal');
        }
    },

    deleteJournal : async (req, res) => {
        try {
            const { id } = req.params;
            const journal = await Journal.findOne({ _id : id })
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'});
            for(let i = 0; i < journal.imageId.length; i++) {
                Image.findOne({_id: journal.imageId[i]._id}).then((image) => {
                    fs.unlink(path.join(`public/${image.imageUrl}`));
                    image.remove();
                }).catch ((err) => {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/band');
                })
            }   
            await Category.updateMany({}, {$pull: { journalId: journal._id }} );
            await journal.remove();
            req.flash('alertMessage', 'Success Delete');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/journal');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/journal');
        }
    }
    
}