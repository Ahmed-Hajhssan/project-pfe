const express = require('express');
const app = express();
const investorRoute = express.Router();
const multer = require('multer');


let Investor = require('../models/Investor');
let Company = require('../models/Company');


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
investorRoute.use('/uploads', express.static('uploads',{ maxage: "864000" }));

// upload single file
investorRoute.post('/file', upload.single('file'), function (req, res, next) {
  const file = req.file;
  if (file) {
    res.json(req.file);
  } else throw "error";
});

//get sector
investorRoute.route('/getsector/:id').get(async (req, res, next) => {
  try {
    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ error: 'investor not found' });
    }

    const sectors = investor.sector; 

    res.json(sectors);
  } catch (error) {
    next(error);
  }
});

//delete sector
investorRoute.route('/deleteSector/:id/:sectorName').delete(async (req, res, next) => {
  try {
    const investor = await Investor.findById(req.params.id);
    const sectorName = req.params.sectorName;

    if (!investor) {
      return res.status(404).json({ message: 'investor not found' });
    }

    const index = investor.sector.indexOf(sectorName);
    if (index !== -1) {
      investor.sector.splice(index, 1);
      await investor.save();
      return res.json({ message: 'sector deleted successfully' });

    } else {
      return res.status(404).json({ message: 'sector not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get investor
investorRoute.route('/read/:id').get(async (req, res, next) => {
  try {
    const investor = await Investor.findById(req.params.id);
    res.json(investor);
  } catch (error) {
    next(error);
  }
});

// Update investor
investorRoute.route('/update/:id').put(async (req, res, next) => {
  try {
    const updatedInvestor = await Investor.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    // Wait for a short delay to ensure the update is completed
    await new Promise(resolve => setTimeout(resolve, 1000));

    const investor = await Investor.findById(updatedInvestor._id);
    res.json(investor);
  } catch (error) {
    next(error);
  }
});

// Add Company
investorRoute.route('/createCompany/:id').post(async (req, res, next) => {
  try {
    // Create a new company
    const newcompany = await Company.create(req.body);
    // Find the investor by ID
    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    // Add the new company to the investor's company array
    investor.companies.push(newcompany._id);

    await investor.save();

    res.json(newcompany);
  } catch (error) {
    next(error);
  }
});

// get all Companies
investorRoute.route('/getCompanies/:id').get(async (req, res, next) => {
  try {

    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    const companies = await Company.find({ _id: { $in: investor.companies } });

    res.json(companies);
  } catch (error) {
    next(error);
  }
});

// Get a single company
investorRoute.route('/getCompany/:companyId').get(async (req, res, next) => {
  try {
    const companyId = req.params.companyId;

    const company = await Company.findOne({ _id: companyId });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// Update a company
investorRoute.route('/updateCompany/:companyId').put(async (req, res, next) => {
  try {
    const companyId = req.params.companyId;
    const updatedData = req.body;

    const company = await Company.findByIdAndUpdate(companyId, updatedData, { new: true });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// Delete a company
investorRoute.route('/deleteCompany/:id/:companyId').delete(async (req, res, next) => {
  try {
    const investorId = req.params.id;
    const companyId = req.params.companyId;

    // Remove the company from the investor's company array
    const investor = await Investor.findByIdAndUpdate(
      investorId,
      { $pull: { companies: companyId } },
      { new: true }
    );

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    // Delete the company
    const company = await Company.findByIdAndDelete(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
});


module.exports = investorRoute;