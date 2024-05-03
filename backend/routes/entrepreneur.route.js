const express = require('express');
const app = express();
const entrepreneurRoute = express.Router();
const multer = require('multer');
const fs = require('fs');



// Entrepreneur model
let Entrepreneur = require('../models/Entrepreneur');
// Member model
let Member = require('../models/Member');
const Currently_raising = require('../models/currently_raising');
const currently_raising = require('../models/currently_raising');
const Question = require('../models/questions');
const previous_round = require('../models/previous_round');
let PreviousRound = require('../models/previous_round');


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
})

const storage = multer.diskStorage({
  destination: './uploads',
  filename: function(req, file, cb) {
    try {
      const fileExtension = file.mimetype.split('/')[1];
      const randomString = Math.random().toString(36).substring(2, 8); 
      const uniqueFilename = Date.now() + '_' + randomString + '.' + fileExtension;
      cb(null, uniqueFilename);
    } catch (error) {
      cb(error);
    }
  }
});

const upload = multer({storage: storage})
entrepreneurRoute.use('/uploads', express.static('uploads',{ maxage: "864000" }));

// upload single file
entrepreneurRoute.post('/file', upload.single('file'), function (req, res, next) {
  const file = req.file;
  if (file) {
    res.json(req.file);
  } else throw "error";
});

// upload multiple files
entrepreneurRoute.post("/multiplefiles", upload.array("files"), function (req, res, next) {
  const files = req.files;
  if (Array.isArray(files) && files.length > 0) {
    res.json(req.files);
  } else {
    res.status(400);
    throw new Error("No file");
  }
});

// delete file
entrepreneurRoute.route('/deletefile/:id').delete(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);
    const filename = entrepreneur.pitch_deck;
    if (filename != null) {
      const filePath = `./uploads/${filename}`;
      fs.unlinkSync(filePath);
      entrepreneur.pitch_deck = null;
      await entrepreneur.save();
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

//delete file from other_document
entrepreneurRoute.route('/deletefile/:id/:filename').delete(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);
    const fileName = req.params.filename;

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    const index = entrepreneur.other_document.indexOf(fileName);
    if (index !== -1) {
      entrepreneur.other_document.splice(index, 1);
      await entrepreneur.save();

      // Delete the file from the storage here
      const filePath = `./uploads/${fileName}`;
      fs.unlinkSync(filePath);

      return res.json({ message: 'File deleted successfully' });
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// delete video
entrepreneurRoute.route('/deleteVideo/:id').delete(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);
    const filename = entrepreneur.video_pitch;
    if (filename != null) {
      const filePath = `./uploads/${filename}`;
      fs.unlinkSync(filePath);
      entrepreneur.video_pitch = null;
      await entrepreneur.save();
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// delete video pitch url
entrepreneurRoute.route('/deletePitchUrl/:id').delete(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);
    const videoPitchUrl = entrepreneur.video_pitchUrl;
    if (videoPitchUrl != null) {
      entrepreneur.video_pitchUrl = null;
      await entrepreneur.save();
    }
    res.json({ message: 'video Pitch Url deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

//get sector
entrepreneurRoute.route('/getsector/:id').get(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);

    if (!entrepreneur) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }

    const sectors = entrepreneur.sector; 

    res.json(sectors);
  } catch (error) {
    next(error);
  }
});

//delete sector
entrepreneurRoute.route('/deleteSector/:id/:sectorName').delete(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);
    const sectorName = req.params.sectorName;

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    const index = entrepreneur.sector.indexOf(sectorName);
    if (index !== -1) {
      entrepreneur.sector.splice(index, 1);
      await entrepreneur.save();
      return res.json({ message: 'sector deleted successfully' });

    } else {
      return res.status(404).json({ message: 'sector not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add Member
entrepreneurRoute.route('/createMember/:id').post(async (req, res, next) => {
  try {
    // Create a new member
    const newMember = await Member.create(req.body);
    // Find the entrepreneur by ID
    const entrepreneur = await Entrepreneur.findById(req.params.id);

    if (!entrepreneur) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }
    // Add the new member to the entrepreneur's member array
    entrepreneur.member.push(newMember._id);

    await entrepreneur.save();

    res.json(newMember);
  } catch (error) {
    next(error);
  }
});

// get all members
entrepreneurRoute.route('/getMembers/:id').get(async (req, res, next) => {
  try {

    const entrepreneur = await Entrepreneur.findById(req.params.id);

    if (!entrepreneur) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }

    const members = await Member.find({ _id: { $in: entrepreneur.member } });

    res.json(members);
  } catch (error) {
    next(error);
  }
});

// Get a single member
entrepreneurRoute.route('/getMember/:memberId').get(async (req, res, next) => {
  try {
    const memberId = req.params.memberId;

    const member = await Member.findOne({ _id: memberId });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
});

// Update a member
entrepreneurRoute.route('/updateMember/:memberId').put(async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const updatedData = req.body;

    const member = await Member.findByIdAndUpdate(memberId, updatedData, { new: true });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
});

// Delete a member
entrepreneurRoute.route('/deleteMember/:id/:memberId').delete(async (req, res, next) => {
  try {
    const entrepreneurId = req.params.id;
    const memberId = req.params.memberId;

    // Remove the member from the entrepreneur's member array
    const entrepreneur = await Entrepreneur.findByIdAndUpdate(
      entrepreneurId,
      { $pull: { member: memberId } },
      { new: true }
    );

    if (!entrepreneur) {
      return res.status(404).json({ error: 'Entrepreneur not found' });
    }
    
    // Delete the member
    const member = await Member.findByIdAndDelete(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get entrepreneur
entrepreneurRoute.route('/read/:id').get(async (req, res, next) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id);
    res.json(entrepreneur);
  } catch (error) {
    next(error);
  }
});

//Get entrepreneurs
entrepreneurRoute.route('/getEntrepreneurs').get(async (req, res, next) => {
  try {
    const entrepreneurs = await Entrepreneur.find();
    res.json(entrepreneurs);
  } catch (error) {
    next(error);
  }
});

// Update entrepreneur
entrepreneurRoute.route('/update/:id').put(async (req, res, next) => {
  try {
    const updatedEntrepreneur = await Entrepreneur.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    // Wait for a short delay to ensure the update is completed
    await new Promise(resolve => setTimeout(resolve, 1000));

    const entrepreneur = await Entrepreneur.findById(updatedEntrepreneur._id);
    res.json(entrepreneur);
  } catch (error) {
    next(error);
  }
});



//  currently raising
// Create Currently_raising for an employee
entrepreneurRoute.post('/:entrepreneurId/currently_raising', async (req, res, next) => {
  try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
      if (!entrepreneur) {
          return res.status(404).json({ error: "Entrepreneur not found" });
      }
      const newCurrentlyRaising = await Currently_raising.create(req.body);
      entrepreneur.currently_raising = (newCurrentlyRaising._id);
      await entrepreneur.save();
      console.log(newCurrentlyRaising)
      res.status(201).json(newCurrentlyRaising);
  } catch (error) {
      next(error);
  }
});

// Get Currently_raising for an employee
entrepreneurRoute.get('/:entrepeneurId/currently_raising', async (req, res, next) => {
  try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepeneurId).populate('currently_raising');
      if (!entrepreneur) {
          return res.status(404).json({ error: "Entrepreneur not found" });
      }

      res.status(200).json(entrepreneur.currently_raising);
  } catch (error) {
      next(error);
  }
});

// Update Currently_raising for an employee
entrepreneurRoute.put('/:entrepreneurId/currently_raising', async (req, res, next) => {
    try {
        const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
        if (!entrepreneur) {
            return res.status(404).json({ error: "Entrepreneur not found" });
        }
  
        // Assuming currently_raising_id is the ID stored in the employee model
        const currently_raising_id = entrepreneur.currently_raising;
  
        // Find the currently_raising document by its ID and update it
        const currentlyRaising = await currently_raising.findByIdAndUpdate(currently_raising_id, req.body, { new: true });
  
        if (!currentlyRaising) {
            return res.status(404).json({ error: "Currently raising record not found" });
        }
  
        res.status(200).json(currentlyRaising);
    } catch (error) {
        next(error);
    }
  });
  
// Delete Currently_raising for an employee
entrepreneurRoute.delete('/:entrepreneurId/currently_raising', async (req, res, next) => {
  try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
      if (!entrepreneur) {
          return res.status(404).json({ error: "Entrepreneur not found" });
      }
      const deletedCurrentlyRaising = entrepreneur.currently_raising;
      entrepreneur.currently_raising = null;
      
      await entrepreneur.save();
      
      await currently_raising.findByIdAndDelete(deletedCurrentlyRaising);
      res.status(200).json(deletedCurrentlyRaising);
  } catch (error) {
      next(error);
  }
});


//  previous rounds
// Create a Previous_round for an employee
entrepreneurRoute.post('/:entrepreneurId/previous_round', async (req, res, next) => {
    try {
        const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
        if (!entrepreneur) {
            return res.status(404).json({ error: "Entrepreneur not found" });
        }
        const newPreviousRound = await PreviousRound.create(req.body);
        entrepreneur.previous_round.push(newPreviousRound._id);
        await entrepreneur.save();
        res.status(201).json(newPreviousRound);
    } catch (error) {
        next(error);
    }
});

// Get Previous_round for an employee
entrepreneurRoute.get('/:entrepreneurId/previous_round', async (req, res, next) => {
    try {
        const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId).populate('previous_round');
        if (!entrepreneur) {
            return res.status(404).json({ error: "Entrepreneur not found" });
        }
        res.status(200).json(entrepreneur.previous_round);
    } catch (error) {
        next(error);
    }
});


// Get a single Previous_round for an employee
entrepreneurRoute.get('/:entrepreneurId/previous_round/:roundId', async (req, res, next) => {
  try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
      if (!entrepreneur) {
          return res.status(404).json({ error: "entrepreneur not found" });
      }
      const roundId = req.params.roundId;
      // Check if the employee's previous_round array contains the round ID
      if (!entrepreneur.previous_round.includes(roundId)) {
          return res.status(404).json({ error: "Previous round not found for this entrepreneur" });
      }
      // If the round ID is found, fetch the PreviousRound document from the database
      const round = await PreviousRound.findById(roundId);
      if (!round) {
          return res.status(404).json({ error: "Previous round document not found" });
      }
      res.status(200).json(round);
  } catch (error) {
      next(error);
  }
});



// Update a Previous_round for an employee
entrepreneurRoute.put('/:entrepreneurId/previous_round/:roundId', async (req, res, next) => {
    try {
        const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
        if (!entrepreneur) {
            return res.status(404).json({ error: "entrepreneur not found" });
        }
        const roundIndex = entrepreneur.previous_round.findIndex(prevRound => prevRound._id.toString() === req.params.roundId);
        if (roundIndex === -1) {
            return res.status(404).json({ error: "Previous round not found" });
        }
        const roundId = req.params.roundId;
  
        // Find the PreviousRound document by its ID and update it
        const previous_round = await PreviousRound.findByIdAndUpdate(roundId, req.body, { new: true });
        if (!previous_round) {
            return res.status(404).json({ error: "Previous Round record not found" });
        }
        res.status(200).json(previous_round)
    } catch (error) {
        next(error);
    }
});

// Delete a Previous_round for an employee
entrepreneurRoute.delete('/:entrepreneurId/previous_round/:roundId', async (req, res, next) => {
    try {
        const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
        if (!entrepreneur) {
            return res.status(404).json({ error: "entrepreneur not found" });
        }
        const roundIndex = entrepreneur.previous_round.findIndex(prevRound => prevRound._id.toString() === req.params.roundId);
        if (roundIndex === -1) {
            return res.status(404).json({ error: "Previous round not found" });
        }
        const deletedRound = entrepreneur.previous_round.splice(roundIndex, 1)[0];
        await entrepreneur.save();
        await previous_round.findByIdAndDelete(req.params.roundId);
        res.status(200).json(deletedRound);
    } catch (error) {
        next(error);
    }
});


//questions
// Create a new question for an employee
entrepreneurRoute.post('/:entrepreneurId/questions', async (req, res, next) => {
    try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
      if (!entrepreneur) {
        return res.status(404).json({ message: 'entrepreneur not found' });
      }
  
      const question = new Question(req.body);
      await question.save();
  
      entrepreneur.questions.push(question._id); // Assuming questions field in Employee schema is an array of question IDs
      await entrepreneur.save();
  
      res.status(201).json(entrepreneur);
    } catch (error) {
      next(error);
    }
  });
  
  // Read all questions for an employee
  entrepreneurRoute.get('/:entrepreneurId/questions', async (req, res, next) => {
    try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId).populate('questions');
      if (!entrepreneur) {
        return res.status(404).json({ message: 'entrepreneur not found' });
      }
  
      res.json(entrepreneur.questions);
    } catch (error) {
      next(error);
    }
  });
  
  // Read a specific question for an employee
  entrepreneurRoute.get('/:entrepreneurId/questions/:questionId', async (req, res, next) => {
    try {
      const question = await Question.findById(req.params.questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      res.json(question);
    } catch (error) {
      next(error);
    }
  });
  
  // Update a question for an employee
  entrepreneurRoute.put('/:entrepreneurId/questions/:questionId', async (req, res, next) => {
    try {
      const question = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      res.json(question);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete a question for an employee
  entrepreneurRoute.delete('/:entrepreneurId/questions/:questionId', async (req, res, next) => {
    try {
      const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId);
      if (!entrepreneur) {
        return res.status(404).json({ message: 'entrepreneur not found' });
      }
      entrepreneur.questions.pull(req.params.questionId); // Assuming questions field in Employee schema is an array of question IDs
      await entrepreneur.save();
      await Question.findByIdAndDelete(req.params.questionId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });


module.exports = entrepreneurRoute;